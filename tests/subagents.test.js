import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSubagent, parseFrontmatter, validateSubagents, listAgentNames, VALID_TOOLS } from '../scripts/agent-validation/sync-claude-agents.js';
import { decide } from '../scripts/hooks/claude-hook.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = listAgentNames();

describe('generated Claude Code subagents', () => {
  test('there are 16 agents, each with a generated .claude/agents/<name>.md', () => {
    assert.equal(names.length, 16);
    for (const n of names) assert.ok(fs.existsSync(path.join(root, '.claude/agents', `${n}.md`)), n);
  });

  test('every file has valid frontmatter whose name equals its filename (so agent_type matches the contract)', () => {
    for (const n of names) {
      const text = fs.readFileSync(path.join(root, '.claude/agents', `${n}.md`), 'utf8');
      const { data, body } = parseFrontmatter(text);
      assert.equal(data.name, n, `${n}: frontmatter name`);
      assert.ok(data.description && data.description.length >= 40, `${n}: description too short`);
      assert.ok(fs.existsSync(path.join(root, 'agents', `${n}.contract.json`)), `${n}: contract exists for agent_type`);
      if (data.tools !== undefined) {
        for (const t of data.tools.split(',').map(x => x.trim())) assert.ok(VALID_TOOLS.includes(t), `${n}: unknown tool ${t}`);
      }
      assert.ok(body.includes('Identity') || body.includes('Mandate'), `${n}: body preserved`);
    }
  });

  test('agents that may spawn others get the Agent tool; others do not', () => {
    for (const n of names) {
      const c = JSON.parse(fs.readFileSync(path.join(root, 'agents', `${n}.contract.json`), 'utf8'));
      const { data } = parseFrontmatter(buildSubagent(n));
      if (data.tools === undefined) continue; // inherits everything
      const hasAgent = data.tools.split(',').map(x => x.trim()).includes('Agent');
      assert.equal(hasAgent, c.may_spawn.length > 0, `${n}: Agent tool vs may_spawn`);
    }
  });

  test('committed files are in sync with their canonical sources (no drift)', () => {
    const r = validateSubagents();
    assert.deepEqual(r.errors, []);
    assert.equal(r.passed, true);
  });

  test('drift is detected when a generated file is edited by hand', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sa-'));
    fs.cpSync(path.join(root, '.claude/agents'), tmp, { recursive: true });
    fs.appendFileSync(path.join(tmp, 'browser-qa.md'), '\nrogue edit\n');
    const r = validateSubagents({ claudeAgentsDir: tmp });
    assert.equal(r.passed, false);
    assert.ok(r.errors.some(e => /browser-qa/.test(e) && /drift|out of sync/i.test(e)));
  });
});

describe('may_spawn enforcement in the hook', () => {
  const spawn = (caller, target) => decide({
    tool_name: 'Agent', ...(caller ? { agent_type: caller } : {}),
    tool_input: { subagent_type: target, prompt: 'do it', description: 'x' }
  });

  test('main session may spawn anything', () => {
    assert.equal(spawn(null, 'browser-qa').allow, true);
    assert.equal(spawn(null, 'general-purpose').allow, true);
  });
  test('an agent with an empty may_spawn cannot spawn at all (incl. built-ins, which would escape its contract)', () => {
    assert.equal(spawn('browser-qa', 'implementation-engineer').allow, false);
    assert.equal(spawn('browser-qa', 'general-purpose').allow, false);
  });
  test('an agent may spawn only its listed targets', () => {
    assert.equal(spawn('design-art-director', 'ux-ui-designer').allow, true);
    assert.equal(spawn('design-art-director', 'implementation-engineer').allow, false);
  });
  test('the Task alias is treated the same', () => {
    const d = decide({ tool_name: 'Task', agent_type: 'browser-qa', tool_input: { subagent_type: 'code-reviewer' } });
    assert.equal(d.allow, false);
  });
  test('settings route Agent/Task calls through the hook', () => {
    const s = JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.json'), 'utf8'));
    assert.match(s.hooks.PreToolUse.map(h => h.matcher).join('|'), /Agent/);
  });
});
