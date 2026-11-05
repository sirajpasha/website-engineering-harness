#!/usr/bin/env node
/**
 * Claude Code PreToolUse adapter.
 *
 * Reads the hook payload (JSON on stdin), runs the harness guards against the
 * *proposed* tool call, and blocks it (exit 2, reason on stderr) on violation:
 *   - Bash                      -> pre-bash-gate (destructive commands)
 *   - Write / Edit / MultiEdit  -> pre-write-gate (secrets, anti-slop, agent
 *                                  write-root contracts) + test-write-lock
 *   - Agent / Task              -> contract `may_spawn` (an agent with a contract may
 *                                  spawn only its listed targets; built-in agents are
 *                                  refused because they would escape the contract)
 *
 * Agent identity comes from the hook payload (`agent_type`, set by Claude Code
 * for subagent calls) with ACTIVE_AGENT as a fallback. The main session has no
 * agent identity and is not contract-restricted. Agents without a contract file
 * (e.g. built-in Explore/Plan) are also unrestricted.
 *
 * Fail-open on malformed input (a broken hook must not brick the session) but
 * fail-closed on every detected violation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectCommand } from './pre-bash-gate.js';
import { inspectWrite } from './pre-write-gate.js';
import { verifyTestModification } from './test-write-lock.js';
import { HARNESS_ROOT, projectRoot } from '../lib/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = HARNESS_ROOT; // agent contracts live with the harness
const projectDirFor = (payload) => path.resolve((payload && payload.cwd && !process.env.CLAUDE_PROJECT_DIR && !process.env.HARNESS_PROJECT_DIR) ? payload.cwd : projectRoot());

function isRedPhaseActive(projectDir) {
  const dir = path.join(projectDir, '.harness', 'receipts');
  const red = path.join(dir, 'red-phase.receipt.json');
  if (!fs.existsSync(red)) return false;
  const green = path.join(dir, 'green-phase.receipt.json');
  return !fs.existsSync(green) || fs.statSync(green).mtimeMs < fs.statSync(red).mtimeMs;
}

const bareName = (n) => String(n || '').replace(/^[^:]+:/, '');

function resolveAgent(payload) {
  // Plugin subagents arrive namespaced as "<plugin>:<agent>"; contracts are keyed by the bare agent name.
  const name = bareName(payload.agent_type || process.env.ACTIVE_AGENT || '');
  if (!name || !/^[a-z0-9-]+$/i.test(name)) return '';
  return fs.existsSync(path.join(rootDir, 'agents', `${name}.contract.json`)) ? name : '';
}

function proposedWrites(toolName, input) {
  const file = input.file_path;
  if (!file) return [];
  if (toolName === 'Write') return [{ file, newText: input.content ?? '', apply: () => input.content ?? '' }];
  if (toolName === 'Edit') {
    return [{
      file,
      newText: input.new_string ?? '',
      apply: old => (old == null ? null : old.replace(input.old_string ?? '', () => input.new_string ?? ''))
    }];
  }
  if (toolName === 'MultiEdit') {
    const edits = input.edits || [];
    return [{
      file,
      newText: edits.map(e => e.new_string ?? '').join('\n'),
      apply: old => (old == null ? null : edits.reduce((acc, e) => acc.replace(e.old_string ?? '', () => e.new_string ?? ''), old))
    }];
  }
  return [];
}

/** contract may_spawn lists ids like "05-ux-ui-designer"; subagent names are the bare "ux-ui-designer". */
function checkSpawn(callerName, input) {
  const target = bareName(input.subagent_type || input.agent_type || '');
  const contract = JSON.parse(fs.readFileSync(path.join(rootDir, 'agents', `${callerName}.contract.json`), 'utf8'));
  const allowed = contract.may_spawn.map(id => id.replace(/^\d+-/, ''));
  if (allowed.includes(target)) return { allow: true };
  const list = allowed.length ? allowed.join(', ') : 'none';
  return { allow: false, reason: `Agent '${callerName}' may not spawn '${target || 'unspecified'}' (contract may_spawn: ${list})` };
}

/** Pure decision function: { allow: boolean, reason?: string } */
export function decide(payload) {
  const tool = payload.tool_name;
  const input = payload.tool_input || {};

  if (tool === 'Bash') {
    const r = inspectCommand(input.command);
    return r.allowed ? { allow: true } : { allow: false, reason: `Command blocked: ${r.blockedReason}` };
  }

  if (tool === 'Agent' || tool === 'Task') {
    const caller = resolveAgent(payload);
    return caller ? checkSpawn(caller, input) : { allow: true };
  }

  const writes = proposedWrites(tool, input);
  if (writes.length === 0) return { allow: true };

  const projectDir = projectDirFor(payload);
  const agentName = resolveAgent(payload);
  const errors = [];
  for (const w of writes) {
    const abs = path.resolve(projectDir, w.file);
    const rel = path.relative(projectDir, abs);
    const insideRepo = !rel.startsWith('..') && !path.isAbsolute(rel);
    const r = inspectWrite({ filePath: w.file, content: w.newText, agentName: insideRepo ? agentName : '', projectDir });
    if (!r.allowed) errors.push(...r.errors);

    if (insideRepo) {
      const old = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
      const next = w.apply(old);
      if (old != null && next != null) {
        const t = verifyTestModification({ filePath: rel, oldContent: old, newContent: next, isRedPhaseActive: isRedPhaseActive(projectDir), projectDir });
        if (!t.allowed) errors.push(...t.violations);
      }
    }
  }
  return errors.length ? { allow: false, reason: errors.join('\n') } : { allow: true };
}

if (process.argv[1] && process.argv[1].endsWith('claude-hook.js')) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', c => (raw += c));
  process.stdin.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      console.error('[harness-hook] Unreadable hook payload; allowing (fail-open on malformed input).');
      process.exit(0);
    }
    const d = decide(payload);
    if (!d.allow) {
      console.error(`[HARNESS GATE BLOCKED]\n${d.reason}`);
      process.exit(2);
    }
    process.exit(0);
  });
}
