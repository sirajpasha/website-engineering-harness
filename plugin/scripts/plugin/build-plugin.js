#!/usr/bin/env node
/**
 * Build the self-contained Claude Code plugin directory `plugin/`.
 *
 * Why a generated directory: Claude Code loads `agents/` at a plugin root as
 * subagents (they need frontmatter), copies an installed plugin into its own cache
 * (so it must carry the scripts its hooks call), and namespaces plugin subagents.
 * The repo root keeps the canonical, tool-agnostic sources; `plugin/` is derived.
 *
 *   plugin/.claude-plugin/plugin.json   manifest (version from package.json)
 *   plugin/agents/*.md                  generated subagents (frontmatter) + *.contract.json + claude-subagents.json
 *   plugin/commands/*.md                slash commands
 *   plugin/hooks/hooks.json             PreToolUse guard (Bash, Write/Edit, Agent)
 *   plugin/.mcp.json                    the harness MCP server
 *   plugin/scripts, standards, templates, workflows, skills, schema, AGENTS.md, LICENSE, README.md
 *
 * Usage: node scripts/plugin/build-plugin.js [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_ROOT } from '../lib/paths.js';
import { buildSubagent, listAgentNames } from '../agent-validation/sync-claude-agents.js';

const PLUGIN_DIR = path.join(HARNESS_ROOT, 'plugin');
const COPY_DIRS = ['scripts', 'standards', 'templates', 'workflows', 'skills', 'schema'];
const COPY_FILES = ['AGENTS.md', 'LICENSE', 'README.md'];
const SKIP = new Set(['node_modules', '.git', '.harness']);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const norm = (t) => t.replace(/\r\n/g, '\n');

/** Slash-command frontmatter: the description is the command's own "## Description" section. */
export function commandWithFrontmatter(text) {
  if (text.startsWith('---\n')) return text;
  const m = text.match(/##\s*Description\s*\n+([\s\S]*?)(?:\n\s*\n|\n##|$)/);
  const description = (m ? m[1] : text.split('\n')[0]).replace(/\s+/g, ' ').trim();
  return `---\ndescription: ${JSON.stringify(description)}\n---\n\n${text}`;
}

/** The complete expected file set: relative path -> Buffer|string. */
export function expectedFiles() {
  const pkg = readJson(path.join(HARNESS_ROOT, 'package.json'));
  const files = new Map();
  const put = (rel, content) => files.set(rel.split(path.sep).join('/'), content);

  const copyTree = (rel) => {
    const abs = path.join(HARNESS_ROOT, rel);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const childRel = path.join(rel, e.name);
      if (e.isDirectory()) copyTree(childRel);
      else put(childRel, fs.readFileSync(path.join(HARNESS_ROOT, childRel)));
    }
  };
  COPY_DIRS.forEach(copyTree);
  for (const f of COPY_FILES) if (fs.existsSync(path.join(HARNESS_ROOT, f))) put(f, fs.readFileSync(path.join(HARNESS_ROOT, f)));

  // Subagents: frontmatter versions replace the raw definitions; contracts + metadata stay beside them.
  for (const name of listAgentNames()) {
    put(`agents/${name}.md`, buildSubagent(name));
    put(`agents/${name}.contract.json`, fs.readFileSync(path.join(HARNESS_ROOT, 'agents', `${name}.contract.json`)));
  }
  put('agents/claude-subagents.json', fs.readFileSync(path.join(HARNESS_ROOT, 'agents', 'claude-subagents.json')));

  for (const f of fs.readdirSync(path.join(HARNESS_ROOT, 'commands')).filter(x => x.endsWith('.md'))) {
    put(`commands/${f}`, commandWithFrontmatter(norm(fs.readFileSync(path.join(HARNESS_ROOT, 'commands', f), 'utf8'))));
  }

  put('package.json', JSON.stringify({ name: pkg.name, version: pkg.version, private: true, type: 'module', description: 'Generated Claude Code plugin build of website-engineering-harness. Do not edit; see scripts/plugin/build-plugin.js.' }, null, 2) + '\n');

  put('.claude-plugin/plugin.json', JSON.stringify({
    name: 'website-engineering-harness',
    version: pkg.version,
    description: pkg.description,
    author: { name: 'Siraj', url: 'https://github.com/sirajpasha' },
    homepage: 'https://github.com/sirajpasha/website-engineering-harness',
    repository: 'https://github.com/sirajpasha/website-engineering-harness',
    license: 'MIT',
    keywords: ['website', 'frontend', 'design', 'quality-gates', 'playwright', 'accessibility', 'tdd', 'agents']
  }, null, 2) + '\n');

  const hookCmd = 'node "${CLAUDE_PLUGIN_ROOT}/scripts/hooks/claude-hook.js"';
  put('hooks/hooks.json', JSON.stringify({
    hooks: {
      PreToolUse: [
        { matcher: 'Bash', hooks: [{ type: 'command', command: hookCmd }] },
        { matcher: 'Write|Edit|MultiEdit|Agent|Task', hooks: [{ type: 'command', command: hookCmd }] }
      ]
    }
  }, null, 2) + '\n');

  put('.mcp.json', JSON.stringify({
    mcpServers: {
      'website-harness': { command: 'node', args: ['${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server/server.js'] }
    }
  }, null, 2) + '\n');

  return files;
}

const asBuffer = (c) => (Buffer.isBuffer(c) ? c : Buffer.from(c, 'utf8'));
const sameContent = (a, b) => {
  // Compare text modulo line endings so Windows checkouts do not register as drift.
  const A = asBuffer(a); const B = asBuffer(b);
  if (A.equals(B)) return true;
  return norm(A.toString('utf8')) === norm(B.toString('utf8'));
};

function listAll(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listAll(p, base, out);
    else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

export function buildPlugin() {
  const files = expectedFiles();
  fs.rmSync(PLUGIN_DIR, { recursive: true, force: true });
  for (const [rel, content] of files) {
    const dest = path.join(PLUGIN_DIR, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
  }
  return files.size;
}

export function checkPlugin() {
  const errors = [];
  if (!fs.existsSync(PLUGIN_DIR)) return { errors: ['plugin/ does not exist (run npm run build:plugin)'] };
  const files = expectedFiles();
  for (const [rel, content] of files) {
    const p = path.join(PLUGIN_DIR, rel);
    if (!fs.existsSync(p)) errors.push(`plugin/${rel} is missing`);
    else if (!sameContent(fs.readFileSync(p), content)) errors.push(`plugin/${rel} is out of sync with its source`);
  }
  for (const rel of listAll(PLUGIN_DIR)) {
    if (!files.has(rel)) errors.push(`plugin/${rel} is unexpected (not produced by the build)`);
  }
  return { errors: errors.slice(0, 25) };
}

if (process.argv[1] && process.argv[1].endsWith('build-plugin.js')) {
  if (process.argv.includes('--check')) {
    const r = checkPlugin();
    r.errors.forEach(e => console.error(`[✖] ${e}`));
    if (!r.errors.length) console.log('[✔] plugin/ is in sync with its sources.');
    process.exit(r.errors.length ? 1 : 0);
  }
  console.log(`Built plugin/ (${buildPlugin()} files).`);
}
