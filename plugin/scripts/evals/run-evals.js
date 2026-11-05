#!/usr/bin/env node
/**
 * Scenario evals for the harness itself.
 *
 * Each scenario states an input and the behaviour the harness MUST exhibit, and
 * the runner checks the real guards and gates against it:
 *
 *   evals/hook-scenarios.json  tool-call payloads  -> claude-hook decide()  (block | allow)
 *   evals/gate-scenarios.json  mutations to a copy of the reference project -> exact set of failing gates
 *
 * Deterministic and offline, so it can gate CI. (Live-model behaviour evals via
 * `claude -p` are non-deterministic and billed; they belong in a separate,
 * non-blocking job.)
 *
 * Fake secrets are never stored in fixtures (the write guard would reject the
 * fixture file itself); fixtures use @@TOKENS@@ expanded here from fragments.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decide } from '../hooks/claude-hook.js';
import { verifyGates, SAMPLE_PROJECT } from '../quality-gates/gate-rules.js';
import { hashProjectSources } from '../quality-gates/evidence.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');

const TOKENS = {
  '@@PRIVATE_KEY@@': '-----BEGIN ' + 'RSA PRIVATE KEY-----',
  '@@AWS_KEY@@': 'AKIA' + 'ABCDEFGHIJKLMNOP'
};

function expandTokens(obj) {
  let s = JSON.stringify(obj);
  for (const [token, value] of Object.entries(TOKENS)) s = s.split(token).join(value);
  return JSON.parse(s);
}

export function runHookScenario(sc) {
  const payload = expandTokens(sc.payload);
  const d = decide(payload);
  const got = d.allow ? 'allow' : 'block';
  if (got !== sc.expect) {
    return { id: sc.id, kind: 'hook', ok: false, detail: `expected ${sc.expect}, got ${got}${d.reason ? ` (${d.reason.split('\n')[0]})` : ''}` };
  }
  if (sc.expect === 'block' && sc.reasonMatches && !new RegExp(sc.reasonMatches, 'i').test(d.reason || '')) {
    return { id: sc.id, kind: 'hook', ok: false, detail: `blocked, but reason did not match /${sc.reasonMatches}/: ${d.reason}` };
  }
  return { id: sc.id, kind: 'hook', ok: true, detail: sc.description || '' };
}

function applyMutation(dir, m) {
  const file = m.file ? path.join(dir, m.file) : null;
  switch (m.op) {
    case 'append': fs.appendFileSync(file, m.text); break;
    case 'delete': fs.rmSync(file, { recursive: true, force: true }); break;
    case 'replace': {
      const before = fs.readFileSync(file, 'utf8');
      const after = before.replace(new RegExp(m.pattern, m.flags || ''), m.with);
      if (after === before) throw new Error(`mutation pattern /${m.pattern}/ matched nothing in ${m.file}`);
      fs.writeFileSync(file, after);
      break;
    }
    case 'rehash-browser': {
      // Refresh the browser report's source hash so G9 is not what fails; isolates the mutation under test.
      const p = path.join(dir, 'reports', 'browser-qa', 'browser-qa.json');
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      j.sourceHash = hashProjectSources(dir);
      fs.writeFileSync(p, JSON.stringify(j));
      break;
    }
    default: throw new Error(`unknown mutation op: ${m.op}`);
  }
}

export function runGateScenario(sc) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-gates-'));
  try {
    fs.cpSync(SAMPLE_PROJECT, dir, { recursive: true });
    for (const m of sc.mutations || []) applyMutation(dir, m);
    const failed = verifyGates(dir).results.filter(r => r.status !== 'PASSED').map(r => r.gate).sort();
    const expected = [...(sc.expectFailedGates || [])].sort();
    const ok = failed.join(',') === expected.join(',');
    return { id: sc.id, kind: 'gate', ok, detail: ok ? (sc.description || '') : `expected failing gates [${expected}], got [${failed}]` };
  } catch (err) {
    return { id: sc.id, kind: 'gate', ok: false, detail: `scenario error: ${err.message}` };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const loadScenarios = (file) => JSON.parse(fs.readFileSync(path.join(rootDir, 'evals', file), 'utf8'));

export function runEvals({ log = () => {} } = {}) {
  const results = [
    ...loadScenarios('hook-scenarios.json').map(runHookScenario),
    ...loadScenarios('gate-scenarios.json').map(runGateScenario)
  ];
  for (const r of results) log(`[${r.ok ? '✔' : '✖'}] ${r.kind.padEnd(4)} ${r.id.padEnd(28)} ${r.detail}`);
  const failed = results.filter(r => !r.ok).length;
  return { passed: failed === 0, total: results.length, failed, results };
}

if (process.argv[1] && process.argv[1].endsWith('run-evals.js')) {
  console.log('====================================================');
  console.log('  HARNESS SCENARIO EVALS');
  console.log('====================================================');
  const r = runEvals({ log: console.log });
  console.log(`\n${r.total - r.failed}/${r.total} scenarios behaved as specified.`);
  process.exit(r.passed ? 0 : 1);
}
