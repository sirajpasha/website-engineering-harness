#!/usr/bin/env node
/**
 * The 20 acceptance scenarios from the modernization brief, with HONEST coverage:
 *   automated  the stated behaviour is fully verified here
 *   partial    the mechanism is verified; a live end-to-end run is not
 *   manual     needs a live/human run; not executed here
 *   gap        required but not mechanically enforced
 * Only automated/partial scenarios are executed; manual and gap are listed, never counted as passed.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { classifyRequest } from '../lib/classify-request.js';
import { discoverAll, resolveAdapter } from '../lib/adapters.js';
import { startRun, timeStatus, SECURITY_GATES_WAIVABLE } from '../lib/time-controller.js';
import { validateRegister } from '../lib/task-register.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../');

export const loadScenarios = (p = path.join(root, 'evals', 'acceptance-scenarios.json')) => JSON.parse(fs.readFileSync(p, 'utf8'));

const probe = (o = {}) => ({ commands: new Set(), modules: new Set(o.modules || []), mcpServers: o.mcpServers || [], env: o.env || {} });
const must = (cond, msg) => { if (!cond) throw new Error(msg); };

const classifyIs = (text, subtype) => () => {
  const r = classifyRequest({ command: 'create', text, hasProject: false });
  must(r.base === 'NEW_WEBSITE' && r.subtype === subtype, `got ${r.base}/${r.subtype}, expected NEW_WEBSITE/${subtype}`);
  return `${r.base}/${r.subtype}`;
};

export const HANDLERS = {
  'classify-corporate': classifyIs('Premium international commodities export company website with enquiry forms', 'CORPORATE_WEBSITE'),
  'classify-ecommerce': classifyIs('An online shop with cart and checkout', 'E_COMMERCE'),
  'classify-portal': classifyIs('Customer portal where clients log in to see invoices', 'CUSTOMER_PORTAL'),
  'classify-fullstack': classifyIs('MVP with a database and an API', 'FULL_STACK_MVP'),
  'redesign-guard': () => {
    must(classifyRequest({ command: 'redesign', text: 'x', hasProject: false }).blocked === true, 'redesign without project not blocked');
    must(!classifyRequest({ command: 'redesign', text: 'x', hasProject: true }).blocked, 'redesign with project blocked');
    return 'blocked without project, allowed with one';
  },
  'improve-guard': () => {
    must(classifyRequest({ command: 'improve', text: 'x', hasProject: false }).blocked === true, 'improve without project not blocked');
    must(!classifyRequest({ command: 'improve', text: 'x', hasProject: true }).blocked, 'improve with project blocked');
    return 'blocked without project, allowed with one';
  },
  'ambiguous-spec': () => {
    const r = classifyRequest({ command: 'create', text: 'make me a website', hasProject: false });
    must(r.confidence === 'low' && r.assumption, 'ambiguous brief not flagged low-confidence with an assumption');
    return 'low confidence + recorded assumption';
  },
  'missing-credentials': () => {
    const d = discoverAll(probe({ mcpServers: ['stitch'] }));
    must(d.stitch.status === 'needs-credentials' && d.stitch.available === false, 'missing credential treated as available');
    return 'needs-credentials, not available';
  },
  'stitch-fallback': () => {
    const r = resolveAdapter('stitch', discoverAll(probe()));
    must(r.adapter === 'local-design' && r.substituted, `got ${r.adapter}`);
    return 'fell back to local-design, substitution recorded';
  },
  'playwright-mcp-fallback': () => {
    const r = resolveAdapter('playwright-mcp', discoverAll(probe({ modules: ['playwright'] })));
    must(r.adapter === 'playwright-cli', `got ${r.adapter}`);
    return 'fell back to playwright-cli';
  },
  'playwright-cli-failure': () => {
    const r = resolveAdapter('playwright-cli', discoverAll(probe()));
    must(r.adapter === 'static-limitation' && /not executed/i.test(r.limitation || ''), 'no stated limitation');
    return 'reported limitation: browser checks not executed';
  },
  'time-exceeded': () => {
    const t0 = new Date('2026-01-01T00:00:00Z');
    const s = timeStatus(startRun('EXPRESS', t0), new Date(t0.getTime() + 61 * 60000));
    must(s.exceeded && s.remainingMin === 0, 'not flagged as exceeded');
    must(SECURITY_GATES_WAIVABLE === false, 'security gates waivable under time pressure');
    return 'exceeded reported; security gates not waivable';
  },
  'budget-hard-stop': () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-'));
    const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'telemetry', 'context-budget.js'), '--turns', '99'], { env: { ...process.env, HARNESS_PROJECT_DIR: dir }, encoding: 'utf8' });
    must(r.status === 1 && /HARD_STOP/.test(r.stdout), `exit ${r.status}: ${r.stdout}`);
    return 'HARD_STOP, non-zero exit';
  },
  'ownership-conflict': () => {
    const t = (id, extra = {}) => ({ id, agent: 'implementation-engineer', model: 'sonnet', dependencies: [], inputs: [], outputs: ['src/x.js'], file_ownership: ['src/'], acceptance: ['x'], time_budget_min: 5, status: 'pending', evidence: [], ...extra });
    must(validateRegister([t('A'), t('B')]).some(e => /ownership conflict/.test(e)), 'concurrent ownership conflict not detected');
    return 'ownership conflict rejected';
  },
};

function checkRef(ref) {
  if (ref.eval) {
    const ids = ['hook', 'gate'].flatMap(k => JSON.parse(fs.readFileSync(path.join(root, 'evals', `${k}-scenarios.json`), 'utf8')).map(s => s.id));
    must(ids.includes(ref.eval), `eval '${ref.eval}' not found (it is executed by npm run evals)`);
    return `covered by eval '${ref.eval}'`;
  }
  const text = fs.readFileSync(path.join(root, ref.test), 'utf8');
  must(text.includes(ref.name), `test '${ref.name}' not found in ${ref.test}`);
  return `covered by test '${ref.name}' in ${ref.test}`;
}

export function runAcceptance(scenarios, { handlers = HANDLERS } = {}) {
  const results = scenarios.map((s) => {
    if (s.kind === 'manual' || s.kind === 'gap') return { n: s.n, title: s.title, kind: s.kind, ran: false, ok: false, detail: s.note || '' };
    try {
      const detail = s.check ? handlers[s.check]?.() ?? (() => { throw new Error(`no handler '${s.check}'`); })() : checkRef(s.ref);
      return { n: s.n, title: s.title, kind: s.kind, ran: true, ok: true, detail };
    } catch (e) {
      return { n: s.n, title: s.title, kind: s.kind, ran: true, ok: false, detail: e.message };
    }
  });
  const count = (k) => scenarios.filter(s => s.kind === k).length;
  return {
    results,
    summary: { automated: count('automated'), partial: count('partial'), manual: count('manual'), gap: count('gap'), passed: results.filter(r => r.ran && r.ok).length, total: scenarios.length },
  };
}

if (process.argv[1] && process.argv[1].endsWith('run-acceptance.js')) {
  const r = runAcceptance(loadScenarios());
  for (const x of r.results) console.log(`${x.ran ? (x.ok ? '[PASS]' : '[FAIL]') : '[NOT RUN]'} #${String(x.n).padStart(2)} ${x.kind.padEnd(9)} ${x.title}${x.detail ? ` - ${x.detail}` : ''}`);
  const s = r.summary;
  console.log(`\n${s.passed}/${s.total} passed (automated ${s.automated}, partial ${s.partial}); not executed: manual ${s.manual}, gap ${s.gap}`);
  process.exit(r.results.some(x => x.ran && !x.ok) ? 1 : 0);
}
