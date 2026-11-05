import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { installTools, TOOLS, mcpCommand } from '../scripts/install/install.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'inst-'));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const readJson = (...p) => JSON.parse(read(...p));
const START = '<!-- website-engineering-harness:start -->';

describe('mcpCommand', () => {
  test('node runner points at this install\'s server; npx runner uses the package spec', () => {
    const n = mcpCommand({ runner: 'node' });
    assert.equal(n.command, 'node');
    assert.ok(n.args[0].replace(/\\/g, '/').endsWith('scripts/mcp-server/server.js'));
    const x = mcpCommand({ runner: 'npx', pkg: 'github:o/r' });
    assert.deepEqual([x.command, ...x.args], ['npx', '-y', 'github:o/r', 'mcp']);
  });
});

describe('installTools', () => {
  test('knows every supported tool', () => {
    assert.deepEqual(Object.keys(TOOLS).sort(), ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'generic', 'windsurf']);
  });

  test('cursor: writes MCP config and an always-on rule', () => {
    const d = tmp();
    const r = installTools({ tools: ['cursor'], dir: d, runner: 'node' });
    assert.ok(readJson(d, '.cursor', 'mcp.json').mcpServers['website-harness']);
    const rule = read(d, '.cursor', 'rules', 'website-harness.mdc');
    assert.match(rule, /alwaysApply: true/);
    assert.match(rule, /harness_check_gates/);
    assert.ok(r.actions.every(a => ['created', 'updated', 'unchanged', 'skipped'].includes(a.action)));
  });

  test('copilot: instructions block + .vscode/mcp.json using the "servers" key', () => {
    const d = tmp();
    installTools({ tools: ['copilot'], dir: d, runner: 'node' });
    assert.match(read(d, '.github', 'copilot-instructions.md'), new RegExp(START));
    assert.ok(readJson(d, '.vscode', 'mcp.json').servers['website-harness']);
  });

  test('gemini and generic write GEMINI.md / AGENTS.md blocks and Gemini settings', () => {
    const d = tmp();
    installTools({ tools: ['gemini', 'generic'], dir: d, runner: 'node' });
    assert.match(read(d, 'GEMINI.md'), new RegExp(START));
    assert.match(read(d, 'AGENTS.md'), new RegExp(START));
    assert.ok(readJson(d, '.gemini', 'settings.json').mcpServers['website-harness']);
  });

  test('claude: .mcp.json + CLAUDE.md block, and points to the plugin for hooks/agents', () => {
    const d = tmp();
    const r = installTools({ tools: ['claude'], dir: d, runner: 'node' });
    assert.ok(readJson(d, '.mcp.json').mcpServers['website-harness']);
    assert.match(read(d, 'CLAUDE.md'), new RegExp(START));
    assert.ok(r.notes.some(n => /plugin marketplace add/.test(n)));
  });

  test('windsurf and codex use global MCP config, so they print a snippet instead of editing $HOME', () => {
    const d = tmp();
    const r = installTools({ tools: ['windsurf', 'codex'], dir: d, runner: 'node' });
    assert.ok(r.notes.some(n => /mcp_config\.json/.test(n)));
    assert.ok(r.notes.some(n => /config\.toml/.test(n)));
    assert.match(read(d, '.windsurfrules'), new RegExp(START));
    assert.match(read(d, 'AGENTS.md'), new RegExp(START));
  });

  test('is idempotent: a second run changes nothing', () => {
    const d = tmp();
    installTools({ tools: ['cursor', 'gemini', 'copilot'], dir: d, runner: 'node' });
    const before = fs.readFileSync(path.join(d, 'GEMINI.md'), 'utf8');
    const r2 = installTools({ tools: ['cursor', 'gemini', 'copilot'], dir: d, runner: 'node' });
    assert.ok(r2.actions.every(a => a.action === 'unchanged'), JSON.stringify(r2.actions.filter(a => a.action !== 'unchanged')));
    assert.equal(fs.readFileSync(path.join(d, 'GEMINI.md'), 'utf8'), before);
  });

  test('preserves existing user content and other MCP servers', () => {
    const d = tmp();
    fs.mkdirSync(path.join(d, '.cursor'), { recursive: true });
    fs.writeFileSync(path.join(d, '.cursor', 'mcp.json'), JSON.stringify({ mcpServers: { mine: { command: 'x' } } }));
    fs.writeFileSync(path.join(d, 'GEMINI.md'), '# My own notes\nkeep me\n');
    installTools({ tools: ['cursor', 'gemini'], dir: d, runner: 'node' });
    const mcp = readJson(d, '.cursor', 'mcp.json');
    assert.ok(mcp.mcpServers.mine && mcp.mcpServers['website-harness']);
    const g = read(d, 'GEMINI.md');
    assert.match(g, /keep me/);
    assert.match(g, new RegExp(START));
  });

  test('updating replaces only our marked block', () => {
    const d = tmp();
    installTools({ tools: ['generic'], dir: d, runner: 'node' });
    const p = path.join(d, 'AGENTS.md');
    fs.writeFileSync(p, 'before\n' + fs.readFileSync(p, 'utf8') + '\nafter\n');
    installTools({ tools: ['generic'], dir: d, runner: 'node' });
    const t = fs.readFileSync(p, 'utf8');
    assert.match(t, /^before/);
    assert.match(t, /after\s*$/);
    assert.equal(t.split(START).length - 1, 1);
  });

  test('refuses to overwrite an unparseable JSON config', () => {
    const d = tmp();
    fs.mkdirSync(path.join(d, '.cursor'), { recursive: true });
    fs.writeFileSync(path.join(d, '.cursor', 'mcp.json'), '{ not json');
    const r = installTools({ tools: ['cursor'], dir: d, runner: 'node' });
    assert.equal(r.actions.find(a => a.file.endsWith('mcp.json')).action, 'skipped');
    assert.equal(read(d, '.cursor', 'mcp.json'), '{ not json');
  });

  test('does not clobber a differing existing server entry without --force', () => {
    const d = tmp();
    fs.mkdirSync(path.join(d, '.cursor'), { recursive: true });
    fs.writeFileSync(path.join(d, '.cursor', 'mcp.json'), JSON.stringify({ mcpServers: { 'website-harness': { command: 'custom' } } }));
    const r = installTools({ tools: ['cursor'], dir: d, runner: 'node' });
    assert.equal(readJson(d, '.cursor', 'mcp.json').mcpServers['website-harness'].command, 'custom');
    assert.equal(r.actions.find(a => a.file.endsWith('mcp.json')).action, 'skipped');
    installTools({ tools: ['cursor'], dir: d, runner: 'node', force: true });
    assert.equal(readJson(d, '.cursor', 'mcp.json').mcpServers['website-harness'].command, 'node');
  });

  test('rejects an unknown tool', () => {
    assert.throws(() => installTools({ tools: ['vim'], dir: tmp() }), /unknown tool/i);
  });

  test('CLI: `install --tool cursor --dir X` works end to end', () => {
    const d = tmp();
    const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'website-engineering-harness-cli.js'), 'install', '--tool', 'cursor', '--dir', d, '--runner', 'node'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(fs.existsSync(path.join(d, '.cursor', 'rules', 'website-harness.mdc')));
  });
});
