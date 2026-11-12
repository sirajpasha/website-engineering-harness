/**
 * Provider-independent adapters for OPTIONAL integrations.
 *
 * Every integration is optional; none is needed for the core local workflow. Each declares:
 * capability discovery (how to detect it), credential names (values are never read into
 * output), a timeout, a bounded retry cap, a cost class, an approval flag and an explicit
 * fallback. Discovery is read-only and offline: it reports "available" only for what is
 * installed/configured, and never claims a live connection it did not verify
 * (live_verified is always false here).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { HARNESS_ROOT, projectRoot } from './paths.js';

const A = (o) => ({ optional: true, cost: 'none', approval_required: false, timeout_ms: 30000, max_retries: 1, fallback: null, credentials: [], ...o });

export const ADAPTERS = {
  stitch:           A({ category: 'design',      detect: { mcp: /stitch/i }, credentials: ['STITCH_API_KEY'], fallback: 'local-design', timeout_ms: 60000 }),
  figma:            A({ category: 'design',      detect: { mcp: /figma/i }, credentials: ['FIGMA_ACCESS_TOKEN'], fallback: 'local-design', timeout_ms: 60000 }),
  'playwright-mcp': A({ category: 'browser',     detect: { mcp: /playwright/i }, fallback: 'playwright-cli' }),
  'playwright-cli': A({ category: 'browser',     detect: { module: 'playwright' }, fallback: 'static-limitation', timeout_ms: 120000 }),
  semgrep:          A({ category: 'security',    detect: { command: ['semgrep'] }, cost: 'free', timeout_ms: 180000 }),
  zap:              A({ category: 'security',    detect: { command: ['zap.sh', 'zap-baseline.py', 'zap.bat'] }, cost: 'free', timeout_ms: 600000 }),
  lighthouse:       A({ category: 'performance', detect: { command: ['lighthouse'], module: 'lighthouse' }, cost: 'free', fallback: 'playwright-vitals', timeout_ms: 120000 }),
  github:           A({ category: 'source',      detect: { command: ['gh'], mcp: /github/i } }),
  sentry:           A({ category: 'monitoring',  detect: { mcp: /sentry/i }, credentials: ['SENTRY_AUTH_TOKEN'], cost: 'paid', approval_required: true }),
  // Built-in fallbacks: always available, never optional.
  'local-design':      { builtin: true, optional: false, category: 'design', cost: 'none', approval_required: false, timeout_ms: 1, max_retries: 0, fallback: null, credentials: [], note: 'Local design-intelligence workflow (hand-written spec; label provenance honestly).' },
  'static-limitation': { builtin: true, optional: false, category: 'browser', cost: 'none', approval_required: false, timeout_ms: 1, max_retries: 0, fallback: null, credentials: [], note: 'No browser automation available: use the existing supported test mechanism and report that browser checks were NOT executed.' },
  'playwright-vitals': { builtin: true, optional: false, category: 'performance', cost: 'none', approval_required: false, timeout_ms: 1, max_retries: 0, fallback: null, credentials: [], note: 'Lab vitals from the existing Playwright run; field metrics remain unmeasured.' },
};

/** probe: { commands:Set, modules:Set, mcpServers:string[] (names only), env:object } */
export function discoverAll(probe) {
  const out = {};
  for (const [id, a] of Object.entries(ADAPTERS)) {
    if (a.builtin) { out[id] = { available: true, status: 'builtin', live_verified: false, reason: a.note }; continue; }
    const d = a.detect || {};
    const found = [];
    if (d.mcp && probe.mcpServers.some(n => d.mcp.test(n))) found.push('mcp-config');
    if (d.command && d.command.some(c => probe.commands.has(c))) found.push('command');
    if (d.module && probe.modules.has(d.module)) found.push('module');
    if (!found.length) { out[id] = { available: false, status: 'missing', live_verified: false, reason: `${id} not detected (optional)` }; continue; }
    const missing_env = a.credentials.filter(k => !probe.env[k]);
    if (missing_env.length) {
      out[id] = { available: false, status: 'needs-credentials', live_verified: false, found, missing_env, reason: `${id} is configured but credential(s) not set: ${missing_env.join(', ')}` };
    } else {
      out[id] = { available: true, status: 'available', live_verified: false, found, reason: `${id} detected (${found.join(', ')}); connection not live-verified` };
    }
  }
  return out;
}

/** Follow only the declared fallback chain. Never fabricate a result. */
export function resolveAdapter(id, discovery) {
  const seen = new Set();
  let cur = id;
  while (cur && !seen.has(cur)) {
    if (discovery[cur]?.available) {
      const substituted = cur !== id;
      const r = { adapter: cur, requested: id, substituted, reason: substituted ? `${id}: ${discovery[id]?.reason || 'unavailable'}; using fallback ${cur}` : 'available' };
      if (ADAPTERS[cur].builtin && cur === 'static-limitation') r.limitation = ADAPTERS[cur].note + ' Browser checks were not executed.';
      return r;
    }
    seen.add(cur);
    cur = ADAPTERS[cur]?.fallback;
  }
  return { adapter: null, requested: id, substituted: false, reason: `${id} not run: unavailable (${discovery[id]?.reason || 'unknown'}) and no fallback; report it as not run` };
}

/** Bounded retries with a per-attempt timeout. Returns a result object; never throws. */
export async function withRetry(fn, { retries = 0, timeoutMs = 30000, maxRetries = 3 } = {}) {
  const attemptsAllowed = Math.min(retries, maxRetries) + 1;
  let lastError = 'unknown error';
  for (let i = 1; i <= attemptsAllowed; i++) {
    let timer;
    try {
      const value = await Promise.race([
        Promise.resolve().then(fn),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs); }),
      ]);
      clearTimeout(timer);
      return { ok: true, value, attempts: i };
    } catch (e) {
      clearTimeout(timer);
      lastError = e?.message || String(e);
    }
  }
  return { ok: false, error: lastError, attempts: attemptsAllowed };
}

const USAGE_FIELDS = ['adapter', 'ok', 'attempts', 'duration_ms', 'substituted', 'reason'];
const usageFile = (dir) => path.join(dir, '.harness', 'telemetry', 'adapter-usage.jsonl');

export function recordAdapterUse(entry, { projectDir = projectRoot() } = {}) {
  const row = { ts: new Date().toISOString() };
  for (const f of USAGE_FIELDS) if (entry[f] !== undefined) row[f] = entry[f];
  fs.mkdirSync(path.dirname(usageFile(projectDir)), { recursive: true });
  fs.appendFileSync(usageFile(projectDir), JSON.stringify(row) + '\n', 'utf8');
  return row;
}

export function readAdapterUse({ projectDir = projectRoot() } = {}) {
  const f = usageFile(projectDir);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
}

function commandExists(cmd) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore', timeout: 5000 });
  return r.status === 0;
}

function mcpNamesFrom(file, key = 'mcpServers') {
  try { return Object.keys(JSON.parse(fs.readFileSync(file, 'utf8'))[key] || {}); } catch { return []; }
}

/** Real probe. MCP server NAMES only are read from config; values/headers are never loaded into output. */
export function defaultProbe({ projectDir = projectRoot() } = {}) {
  const commands = new Set();
  for (const a of Object.values(ADAPTERS)) for (const c of a.detect?.command || []) if (commandExists(c)) commands.add(c);
  const modules = new Set();
  for (const base of [projectDir, HARNESS_ROOT]) {
    const req = createRequire(path.join(base, 'noop.js'));
    for (const a of Object.values(ADAPTERS)) {
      const m = a.detect?.module;
      if (m) { try { req.resolve(m); modules.add(m); } catch { /* not installed */ } }
    }
  }
  const mcpServers = [
    ...mcpNamesFrom(path.join(projectDir, '.mcp.json')),
    ...mcpNamesFrom(path.join(projectDir, 'mcp.json')),
    ...mcpNamesFrom(path.join(os.homedir(), '.claude.json')),
  ];
  return { commands, modules, mcpServers: [...new Set(mcpServers)], env: process.env };
}
