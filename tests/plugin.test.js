import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { decide } from '../scripts/hooks/claude-hook.js';
import { buildPlugin, checkPlugin } from '../scripts/plugin/build-plugin.js';
import { importFromProject } from '../scripts/lib/paths.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (...p) => JSON.parse(fs.readFileSync(path.join(root, ...p), 'utf8'));

describe('plugin-namespaced agent identity', () => {
  test('agent_type "plugin:name" resolves to the contract for "name"', () => {
    const d = decide({ tool_name: 'Write', agent_type: 'website-engineering-harness:browser-qa', tool_input: { file_path: 'src/app.js', content: 'x' } });
    assert.equal(d.allow, false);
    assert.match(d.reason, /browser-qa/);
  });
  test('namespaced spawn targets are matched against may_spawn', () => {
    const ok = decide({ tool_name: 'Agent', agent_type: 'website-engineering-harness:design-art-director', tool_input: { subagent_type: 'website-engineering-harness:ux-ui-designer' } });
    assert.equal(ok.allow, true);
    const bad = decide({ tool_name: 'Agent', agent_type: 'website-engineering-harness:design-art-director', tool_input: { subagent_type: 'website-engineering-harness:browser-qa' } });
    assert.equal(bad.allow, false);
  });
});

describe('resolving optional dependencies from the user project', () => {
  test('importFromProject finds a package installed only in the project', async () => {
    const proj = fs.mkdtempSync(path.join(os.tmpdir(), 'dep-'));
    fs.mkdirSync(path.join(proj, 'node_modules', 'fake-dep'), { recursive: true });
    fs.writeFileSync(path.join(proj, 'node_modules', 'fake-dep', 'package.json'), JSON.stringify({ name: 'fake-dep', version: '1.0.0', main: 'index.js' }));
    fs.writeFileSync(path.join(proj, 'node_modules', 'fake-dep', 'index.js'), 'module.exports = { hello: "from project" };');
    const m = await importFromProject('fake-dep', proj);
    assert.equal((m.default || m).hello, 'from project');
  });
  test('importFromProject rejects when the package exists nowhere', async () => {
    await assert.rejects(() => importFromProject('definitely-not-installed-xyz', fs.mkdtempSync(path.join(os.tmpdir(), 'dep-'))));
  });
});

describe('generated Claude Code plugin (plugin/)', () => {
  const plugin = path.join(root, 'plugin');

  test('plugin directory is in sync with its sources (no drift)', () => {
    assert.deepEqual(checkPlugin().errors, []);
  });

  test('manifest, hooks, MCP config and subagents are present', () => {
    const m = readJson('plugin', '.claude-plugin', 'plugin.json');
    assert.equal(m.name, 'website-engineering-harness');
    assert.equal(m.version, readJson('package.json').version);
    const hooks = readJson('plugin', 'hooks', 'hooks.json');
    const matchers = hooks.hooks.PreToolUse.map(h => h.matcher).join('|');
    for (const t of ['Bash', 'Write', 'Edit', 'Agent']) assert.match(matchers, new RegExp(t));
    assert.ok(JSON.stringify(hooks).includes('${CLAUDE_PLUGIN_ROOT}'));
    const mcp = readJson('plugin', '.mcp.json');
    assert.ok(JSON.stringify(mcp).includes('${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server/server.js'));
    const agents = fs.readdirSync(path.join(plugin, 'agents')).filter(f => f.endsWith('.md'));
    assert.equal(agents.length, 16);
    for (const a of agents) assert.ok(fs.readFileSync(path.join(plugin, 'agents', a), 'utf8').startsWith('---\nname: '), a);
  });

  test('the plugin is self-contained: its hook blocks a contract violation when run from the plugin copy', () => {
    const proj = fs.mkdtempSync(path.join(os.tmpdir(), 'plug-proj-'));
    const run = (payload) => spawnSync(process.execPath, [path.join(plugin, 'scripts', 'hooks', 'claude-hook.js')], {
      input: JSON.stringify(payload), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: proj }
    });
    const bad = run({ tool_name: 'Write', agent_type: 'website-engineering-harness:browser-qa', tool_input: { file_path: 'src/x.js', content: 'x' } });
    assert.equal(bad.status, 2, bad.stderr);
    const ok = run({ tool_name: 'Bash', tool_input: { command: 'npm test' } });
    assert.equal(ok.status, 0, ok.stderr);
  });

  test('the plugin\'s MCP server starts from the plugin copy', () => {
    const r = spawnSync(process.execPath, [path.join(plugin, 'scripts', 'mcp-server', 'server.js')], {
      input: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) + '\n', encoding: 'utf8', timeout: 20000
    });
    assert.match(r.stdout, /harness_check_gates/);
  });

  test('buildPlugin is idempotent', () => {
    buildPlugin();
    assert.deepEqual(checkPlugin().errors, []);
  });
});

describe('marketplace + Gemini extension manifests', () => {
  test('marketplace lists the plugin from ./plugin', () => {
    const mk = readJson('.claude-plugin', 'marketplace.json');
    assert.ok(mk.name && mk.owner?.name);
    const p = mk.plugins.find(x => x.name === 'website-engineering-harness');
    assert.equal(p.source, './plugin');
  });
  test('gemini-extension.json loads GEMINI.md and the MCP server', () => {
    const g = readJson('gemini-extension.json');
    assert.equal(g.name, 'website-engineering-harness');
    assert.equal(g.version, readJson('package.json').version);
    assert.equal(g.contextFileName, 'GEMINI.md');
    assert.ok(JSON.stringify(g.mcpServers).includes('scripts/mcp-server/server.js'));
  });
});
