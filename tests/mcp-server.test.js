import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = path.join(root, 'scripts', 'mcp-server', 'server.js');

/** Minimal MCP stdio client: newline-delimited JSON-RPC. */
function startClient(env = {}) {
  const child = spawn(process.execPath, [SERVER], { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '';
  const waiting = new Map();
  const stray = [];
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { stray.push(line); continue; }
      if (msg.id !== undefined && waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id); }
    }
  });
  let n = 0;
  const request = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++n;
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${method}`)), 60000);
    waiting.set(id, (m) => { clearTimeout(t); resolve(m); });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
  const notify = (method, params = {}) => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  return { child, request, notify, stray, close: () => child.kill() };
}

describe('MCP server (stdio)', () => {
  let c;
  let project;
  before(async () => {
    project = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-proj-'));
    fs.cpSync(path.join(root, 'examples', 'sample-website'), project, { recursive: true });
    c = startClient();
    const init = await c.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
    assert.equal(init.result.serverInfo.name, 'website-engineering-harness');
    c.notify('notifications/initialized');
  });
  after(() => c.close());

  test('initialize negotiates a protocol version and advertises tools, prompts, resources', async () => {
    const r = await c.request('initialize', { protocolVersion: '1999-01-01', capabilities: {}, clientInfo: { name: 't', version: '0' } });
    assert.ok(r.result.protocolVersion);
    assert.ok(r.result.capabilities.tools && r.result.capabilities.prompts && r.result.capabilities.resources);
  });

  test('tools/list exposes the harness tools with input schemas', async () => {
    const r = await c.request('tools/list');
    const names = r.result.tools.map(t => t.name).sort();
    for (const n of ['harness_browser_qa', 'harness_walkthrough', 'harness_check_gates', 'harness_check_ratchets', 'harness_inspect_command', 'harness_inspect_write', 'harness_list_agents']) {
      assert.ok(names.includes(n), `missing tool ${n}`);
    }
    assert.ok(r.result.tools.every(t => t.description && t.inputSchema?.type === 'object'));
  });

  test('harness_check_gates verifies a project and reports per-gate results', async () => {
    const r = await c.request('tools/call', { name: 'harness_check_gates', arguments: { project_dir: project } });
    assert.notEqual(r.result.isError, true);
    const out = JSON.parse(r.result.content[0].text);
    assert.equal(out.total, 13);
    assert.equal(out.passed, 13);
  });

  test('harness_check_gates fails an empty project (isError false, but passed 0)', async () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-empty-'));
    const r = await c.request('tools/call', { name: 'harness_check_gates', arguments: { project_dir: empty } });
    assert.equal(JSON.parse(r.result.content[0].text).passed, 0);
  });

  test('harness_inspect_command blocks destructive commands and allows safe ones', async () => {
    const bad = await c.request('tools/call', { name: 'harness_inspect_command', arguments: { command: 'git push --force origin main' } });
    assert.equal(JSON.parse(bad.result.content[0].text).allowed, false);
    const ok = await c.request('tools/call', { name: 'harness_inspect_command', arguments: { command: 'npm test' } });
    assert.equal(JSON.parse(ok.result.content[0].text).allowed, true);
  });

  test('harness_inspect_write enforces agent contracts and anti-slop rules', async () => {
    const bad = await c.request('tools/call', { name: 'harness_inspect_write', arguments: { file_path: 'src/app.js', content: 'x', agent: 'browser-qa', project_dir: project } });
    assert.equal(JSON.parse(bad.result.content[0].text).allowed, false);
    const slop = await c.request('tools/call', { name: 'harness_inspect_write', arguments: { file_path: 'src/a.css', content: '.a{background:linear-gradient(135deg,#667eea,#764ba2)}', project_dir: project } });
    assert.equal(JSON.parse(slop.result.content[0].text).allowed, false);
    const fine = await c.request('tools/call', { name: 'harness_inspect_write', arguments: { file_path: 'src/a.css', content: '.a{color:var(--c)}', project_dir: project } });
    assert.equal(JSON.parse(fine.result.content[0].text).allowed, true);
  });

  test('harness_list_agents lists all 16 agents', async () => {
    const r = await c.request('tools/call', { name: 'harness_list_agents', arguments: {} });
    const out = JSON.parse(r.result.content[0].text);
    assert.equal(out.agents.length, 16);
    assert.ok(out.agents.every(a => a.name && a.description));
  });

  test('harness_check_ratchets measures the project (stale/unmeasured is reported, not faked)', async () => {
    const r = await c.request('tools/call', { name: 'harness_check_ratchets', arguments: { project_dir: project } });
    const out = JSON.parse(r.result.content[0].text);
    assert.ok(Array.isArray(out.results));
    assert.equal(typeof out.passed, 'boolean');
  });

  test('harness_browser_qa runs a real 6-viewport browser pass on the project', async () => {
    const r = await c.request('tools/call', { name: 'harness_browser_qa', arguments: { project_dir: project } });
    const out = JSON.parse(r.result.content[0].text);
    assert.equal(out.viewportsTested, 6, out.log);
    assert.equal(out.passed, true, out.log);
  });

  test('harness_walkthrough fails closed on a missing target instead of pretending', async () => {
    const r = await c.request('tools/call', { name: 'harness_walkthrough', arguments: { target: path.join(project, 'definitely-missing.html') } });
    const out = JSON.parse(r.result.content[0].text);
    assert.equal(out.passed, false);
    assert.equal(out.recorded, false);
  });

  test('unknown tool returns a tool error, not a crash', async () => {
    const r = await c.request('tools/call', { name: 'nope', arguments: {} });
    assert.ok(r.error || r.result?.isError);
  });

  test('prompts: every agent is available as a prompt carrying its full definition', async () => {
    const list = await c.request('prompts/list');
    assert.ok(list.result.prompts.length >= 16);
    const name = list.result.prompts.find(p => p.name === 'browser-qa').name;
    const got = await c.request('prompts/get', { name });
    assert.match(got.result.messages[0].content.text, /Playwright Browser Engineer/);
  });

  test('resources: standards and agent definitions can be listed and read', async () => {
    const list = await c.request('resources/list');
    const uris = list.result.resources.map(r => r.uri);
    assert.ok(uris.includes('harness://standards/security'));
    assert.ok(uris.includes('harness://agents/orchestrator'));
    const read = await c.request('resources/read', { uri: 'harness://standards/security' });
    assert.ok(read.result.contents[0].text.length > 100);
  });

  test('resources/read rejects path traversal', async () => {
    const r = await c.request('resources/read', { uri: 'harness://standards/../../package' });
    assert.ok(r.error);
  });

  test('stdout carries only JSON-RPC (no stray log lines)', async () => {
    await c.request('tools/call', { name: 'harness_check_gates', arguments: { project_dir: project } });
    assert.deepEqual(c.stray, []);
  });

  test('unknown method returns a JSON-RPC error', async () => {
    const r = await c.request('does/not/exist');
    assert.equal(r.error.code, -32601);
  });
});
