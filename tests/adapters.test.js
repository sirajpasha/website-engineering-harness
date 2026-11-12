import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ADAPTERS, discoverAll, resolveAdapter, withRetry, recordAdapterUse, readAdapterUse, defaultProbe } from '../scripts/lib/adapters.js';

const probe = (o = {}) => ({
  commands: new Set(o.commands || []),
  modules: new Set(o.modules || []),
  mcpServers: o.mcpServers || [],
  env: o.env || {},
});

describe('adapter definitions', () => {
  test('every adapter declares timeouts, bounded retries, a cost class and a fallback that exists', () => {
    for (const [id, a] of Object.entries(ADAPTERS)) {
      assert.ok(a.timeout_ms > 0, `${id} timeout`);
      assert.ok(a.max_retries >= 0 && a.max_retries <= 3, `${id} retry cap`);
      assert.ok(['none', 'free', 'paid'].includes(a.cost), `${id} cost`);
      assert.ok(a.fallback === null || ADAPTERS[a.fallback], `${id} fallback`);
    }
  });
  test('the listed optional integrations are all present and none is mandatory', () => {
    for (const id of ['stitch', 'figma', 'playwright-mcp', 'playwright-cli', 'semgrep', 'zap', 'lighthouse', 'github', 'sentry']) {
      assert.ok(ADAPTERS[id], id);
      assert.equal(ADAPTERS[id].optional, true, `${id} optional`);
    }
  });
  test('paid or production-affecting adapters require approval', () => {
    assert.equal(ADAPTERS.sentry.approval_required, true);
    for (const a of Object.values(ADAPTERS)) if (a.cost === 'paid') assert.equal(a.approval_required, true);
  });
  test('nothing requires Supabase, Vercel or any hosting provider', () => {
    assert.ok(!/supabase|vercel/i.test(Object.keys(ADAPTERS).join(' ')));
  });
});

describe('capability discovery', () => {
  test('nothing installed: optional adapters are missing, built-in fallbacks are available', () => {
    const d = discoverAll(probe());
    assert.equal(d.stitch.status, 'missing');
    assert.equal(d.semgrep.available, false);
    assert.equal(d['local-design'].available, true);
    assert.equal(d['static-limitation'].available, true);
  });
  test('an MCP server entry without its credential is reported as needing credentials, never as available', () => {
    const d = discoverAll(probe({ mcpServers: ['stitch'] }));
    assert.equal(d.stitch.status, 'needs-credentials');
    assert.equal(d.stitch.available, false);
    assert.deepEqual(d.stitch.missing_env, ['STITCH_API_KEY']);
  });
  test('configured server plus credential is available but explicitly not live-verified; secret values are never reported', () => {
    const d = discoverAll(probe({ mcpServers: ['stitch'], env: { STITCH_API_KEY: 'super-secret-value' } }));
    assert.equal(d.stitch.available, true);
    assert.equal(d.stitch.live_verified, false);
    assert.ok(!JSON.stringify(d).includes('super-secret-value'));
  });
  test('command and module based adapters are detected', () => {
    const d = discoverAll(probe({ commands: ['semgrep'], modules: ['playwright'] }));
    assert.equal(d.semgrep.available, true);
    assert.equal(d['playwright-cli'].available, true);
  });
});

describe('graceful fallback', () => {
  test('stitch unavailable -> local design workflow, substitution recorded', () => {
    const r = resolveAdapter('stitch', discoverAll(probe()));
    assert.equal(r.adapter, 'local-design');
    assert.equal(r.substituted, true);
    assert.equal(r.requested, 'stitch');
    assert.match(r.reason, /stitch/i);
  });
  test('playwright MCP unavailable -> CLI; both unavailable -> reported limitation, not a silent pass', () => {
    assert.equal(resolveAdapter('playwright-mcp', discoverAll(probe({ modules: ['playwright'] }))).adapter, 'playwright-cli');
    const r = resolveAdapter('playwright-mcp', discoverAll(probe()));
    assert.equal(r.adapter, 'static-limitation');
    assert.match(r.limitation, /not (run|executed)|limitation/i);
  });
  test('adapter with no fallback is reported as not run, never faked', () => {
    const r = resolveAdapter('semgrep', discoverAll(probe()));
    assert.equal(r.adapter, null);
    assert.match(r.reason, /not run/i);
  });
  test('requested adapter available -> used as is', () => {
    const r = resolveAdapter('semgrep', discoverAll(probe({ commands: ['semgrep'] })));
    assert.equal(r.adapter, 'semgrep');
    assert.equal(r.substituted, false);
  });
});

describe('bounded execution', () => {
  test('retries are capped and the error is returned, not thrown', async () => {
    let calls = 0;
    const r = await withRetry(async () => { calls++; throw new Error('boom'); }, { retries: 99, timeoutMs: 100, maxRetries: 2 });
    assert.equal(r.ok, false); assert.equal(calls, 3); assert.equal(r.attempts, 3);
    assert.match(r.error, /boom/);
  });
  test('succeeds after a transient failure', async () => {
    let calls = 0;
    const r = await withRetry(async () => { if (++calls < 2) throw new Error('flaky'); return 'ok'; }, { retries: 2, timeoutMs: 100, maxRetries: 3 });
    assert.deepEqual([r.ok, r.value, r.attempts], [true, 'ok', 2]);
  });
  test('a hung call times out', async () => {
    const r = await withRetry(() => new Promise(() => {}), { retries: 0, timeoutMs: 30, maxRetries: 0 });
    assert.equal(r.ok, false); assert.match(r.error, /timed out/i);
  });
});

describe('usage tracking', () => {
  test('appends adapter usage rows under the project and drops unknown fields', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ad-'));
    recordAdapterUse({ adapter: 'semgrep', ok: true, attempts: 1, duration_ms: 12, token: 'nope' }, { projectDir: dir });
    const rows = readAdapterUse({ projectDir: dir });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].adapter, 'semgrep');
    assert.ok(rows[0].ts);
    assert.ok(!('token' in rows[0]));
  });
  test('defaultProbe returns the expected shape without throwing', () => {
    const p = defaultProbe();
    assert.ok(p.commands instanceof Set && p.modules instanceof Set && Array.isArray(p.mcpServers) && typeof p.env === 'object');
  });
});
