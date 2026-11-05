#!/usr/bin/env node
/**
 * Install the harness into a website project for any AI tool.
 *
 *   website-engineering-harness install --tool cursor|claude|gemini|copilot|codex|windsurf|generic|all
 *                                       [--dir <project>] [--runner auto|npx|node] [--package <spec>] [--force]
 *
 * Writes only project-level files. It never edits global tool configuration (Windsurf and Codex
 * keep MCP config in $HOME): for those it prints the snippet to paste. It never overwrites a user
 * file: instruction text goes into a marked block that is replaced in place, and JSON configs are
 * merged (an unparseable file, or a differing existing entry, is left alone unless --force).
 */
import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_ROOT, projectRoot } from '../lib/paths.js';

const START = '<!-- website-engineering-harness:start -->';
const END = '<!-- website-engineering-harness:end -->';
const SERVER_NAME = 'website-harness';
export const DEFAULT_PACKAGE = 'github:sirajpasha/website-engineering-harness';

/** How an MCP client should launch the server. */
export function mcpCommand({ runner = 'auto', pkg = DEFAULT_PACKAGE } = {}) {
  let r = runner;
  if (r === 'auto') r = fs.existsSync(path.join(HARNESS_ROOT, '.git')) ? 'node' : 'npx'; // a clone runs in place; an installed package is launched via npx
  if (r === 'node') return { command: 'node', args: [path.join(HARNESS_ROOT, 'scripts', 'mcp-server', 'server.js').replace(/\\/g, '/')] };
  return { command: 'npx', args: ['-y', pkg, 'mcp'] };
}

const instructions = () => fs.readFileSync(path.join(HARNESS_ROOT, 'integrations', 'harness-instructions.md'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const block = () => `${START}\n${instructions()}\n${END}`;

// ───────────────────────── file writers (each returns an action record)
function writeBlock(file, rel) {
  const b = block();
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, b + '\n');
    return { file: rel, action: 'created' };
  }
  const cur = fs.readFileSync(file, 'utf8');
  const s = cur.indexOf(START);
  const e = cur.indexOf(END);
  let next;
  if (s >= 0 && e > s) next = cur.slice(0, s) + b + cur.slice(e + END.length);
  else next = cur.replace(/\s*$/, '') + '\n\n' + b + '\n';
  if (next === cur) return { file: rel, action: 'unchanged' };
  fs.writeFileSync(file, next);
  return { file: rel, action: s >= 0 ? 'updated' : 'updated', note: s >= 0 ? 'replaced harness block' : 'appended harness block' };
}

function mergeMcpJson(file, rel, key, entry, force) {
  let json = {};
  const existed = fs.existsSync(file);
  if (existed) {
    try { json = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { return { file: rel, action: 'skipped', note: 'existing file is not valid JSON; left untouched' }; }
  }
  json[key] = json[key] || {};
  const cur = json[key][SERVER_NAME];
  if (cur && JSON.stringify(cur) === JSON.stringify(entry)) return { file: rel, action: 'unchanged' };
  if (cur && !force) return { file: rel, action: 'skipped', note: `a different "${SERVER_NAME}" entry exists; use --force to replace` };
  json[key][SERVER_NAME] = entry;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
  return { file: rel, action: existed ? 'updated' : 'created' };
}

function writeOwnedFile(file, rel, content, force) {
  if (fs.existsSync(file)) {
    const cur = fs.readFileSync(file, 'utf8');
    if (cur === content) return { file: rel, action: 'unchanged' };
    if (!cur.includes(START) && !cur.includes('website-engineering-harness') && !force) return { file: rel, action: 'skipped', note: 'file exists and is not ours; use --force' };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return { file: rel, action: fs.existsSync(file) ? 'created' : 'created' };
}

// ───────────────────────── per-tool installers
export const TOOLS = {
  claude: (ctx) => {
    ctx.actions.push(mergeMcpJson(path.join(ctx.dir, '.mcp.json'), '.mcp.json', 'mcpServers', ctx.stdio, ctx.force));
    ctx.actions.push(writeBlock(path.join(ctx.dir, 'CLAUDE.md'), 'CLAUDE.md'));
    ctx.notes.push('Claude Code: for the 16 subagents, 15 slash commands and the guard hooks, install the plugin:\n    /plugin marketplace add sirajpasha/website-engineering-harness\n    /plugin install website-engineering-harness@website-engineering-harness');
  },
  cursor: (ctx) => {
    ctx.actions.push(mergeMcpJson(path.join(ctx.dir, '.cursor', 'mcp.json'), '.cursor/mcp.json', 'mcpServers', ctx.stdio, ctx.force));
    const rule = `---\ndescription: Website Engineering Harness - quality gates, anti-slop design, TDD, real-browser QA\nalwaysApply: true\n---\n${block()}\n`;
    ctx.actions.push(writeOwnedFile(path.join(ctx.dir, '.cursor', 'rules', 'website-harness.mdc'), '.cursor/rules/website-harness.mdc', rule, ctx.force));
  },
  copilot: (ctx) => {
    ctx.actions.push(writeBlock(path.join(ctx.dir, '.github', 'copilot-instructions.md'), '.github/copilot-instructions.md'));
    ctx.actions.push(mergeMcpJson(path.join(ctx.dir, '.vscode', 'mcp.json'), '.vscode/mcp.json', 'servers', { type: 'stdio', ...ctx.stdio }, ctx.force));
  },
  gemini: (ctx) => {
    ctx.actions.push(writeBlock(path.join(ctx.dir, 'GEMINI.md'), 'GEMINI.md'));
    ctx.actions.push(mergeMcpJson(path.join(ctx.dir, '.gemini', 'settings.json'), '.gemini/settings.json', 'mcpServers', ctx.stdio, ctx.force));
    ctx.notes.push('Gemini CLI alternative (adds all roles as an extension): gemini extensions install https://github.com/sirajpasha/website-engineering-harness');
  },
  windsurf: (ctx) => {
    ctx.actions.push(writeBlock(path.join(ctx.dir, '.windsurfrules'), '.windsurfrules'));
    ctx.notes.push(`Windsurf keeps MCP servers in a global file. Add this under "mcpServers" in ~/.codeium/windsurf/mcp_config.json:\n    "${SERVER_NAME}": ${JSON.stringify(ctx.stdio)}`);
  },
  codex: (ctx) => {
    ctx.actions.push(writeBlock(path.join(ctx.dir, 'AGENTS.md'), 'AGENTS.md'));
    ctx.notes.push(`Codex keeps MCP servers in ~/.codex/config.toml. Add:\n    [mcp_servers.${SERVER_NAME}]\n    command = ${JSON.stringify(ctx.stdio.command)}\n    args = ${JSON.stringify(ctx.stdio.args)}`);
  },
  generic: (ctx) => {
    ctx.actions.push(writeBlock(path.join(ctx.dir, 'AGENTS.md'), 'AGENTS.md'));
    ctx.notes.push('Generic: any tool that reads AGENTS.md (Aider, OpenCode, Cline, Zed, ...) now has the instructions. To add the tools, register an MCP stdio server:\n    ' + JSON.stringify(ctx.stdio));
  }
};

export function installTools({ tools, dir = projectRoot(), runner = 'auto', pkg = DEFAULT_PACKAGE, force = false } = {}) {
  const list = tools.includes('all') ? Object.keys(TOOLS) : tools;
  for (const t of list) if (!TOOLS[t]) throw new Error(`Unknown tool '${t}'. Choose from: ${Object.keys(TOOLS).join(', ')}, all`);
  const ctx = { dir: path.resolve(dir), force, stdio: mcpCommand({ runner, pkg }), actions: [], notes: [] };
  // De-duplicate shared targets (e.g. AGENTS.md for codex + generic) by file.
  for (const t of list) TOOLS[t](ctx);
  const seen = new Map();
  for (const a of ctx.actions) if (!seen.has(a.file) || a.action !== 'unchanged') seen.set(a.file, a);
  return { dir: ctx.dir, actions: [...seen.values()], notes: [...new Set(ctx.notes)] };
}

export function printResult(r, log = console.log) {
  log(`Installed into ${r.dir}\n`);
  for (const a of r.actions) log(`  [${a.action.padEnd(9)}] ${a.file}${a.note ? `  — ${a.note}` : ''}`);
  if (r.notes.length) { log('\nNext steps:'); r.notes.forEach(n => log(`  • ${n}`)); }
  log('\nBrowser QA needs Playwright in the project:  npm i -D playwright axe-core && npx playwright install chromium');
}

export function parseInstallArgs(argv) {
  const get = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
  return {
    tools: (get('--tool') || '').split(',').map(s => s.trim()).filter(Boolean),
    dir: get('--dir') ? path.resolve(get('--dir')) : projectRoot(),
    runner: get('--runner') || 'auto',
    pkg: get('--package') || DEFAULT_PACKAGE,
    force: argv.includes('--force')
  };
}

if (process.argv[1] && process.argv[1].endsWith('install.js')) {
  const opts = parseInstallArgs(process.argv.slice(2));
  if (!opts.tools.length) {
    console.error(`Usage: install --tool <${Object.keys(TOOLS).join('|')}|all>[,tool2] [--dir <project>] [--runner auto|npx|node] [--package <spec>] [--force]`);
    process.exit(1);
  }
  try { printResult(installTools(opts)); } catch (e) { console.error(e.message); process.exit(1); }
}
