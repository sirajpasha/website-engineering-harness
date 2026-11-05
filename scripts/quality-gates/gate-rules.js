/**
 * Content-aware quality gate rules (G1–G13).
 *
 * A gate passes only when its evidence is present in the TARGET PROJECT, is not
 * an unfilled template, and satisfies machine-checkable rules for that gate.
 * Evidence is never borrowed from `templates/` or `examples/` — the reference
 * project is only used when it is explicitly the target.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashProjectSources } from './evidence.js';
import { checkAntiSlop } from '../hooks/pre-write-gate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const HARNESS_ROOT = path.resolve(__dirname, '../../');
export const SAMPLE_PROJECT = path.join(HARNESS_ROOT, 'examples', 'sample-website');

const MIN_DOC_CHARS = 150;
const MAX_MOTION_MS = 300;
const PLACEHOLDER = /\{\{[^}]*\}\}|\bTODO\b|\bTBD\b|\bFIXME\b|\[(?:PLACEHOLDER|INSERT|FILL)[^\]]*\]|lorem ipsum/i;

const exists = (p) => fs.existsSync(p);
const readText = (p) => fs.readFileSync(p, 'utf8');

function listFiles(dir, exts, skip = ['node_modules', '.git', 'reports']) {
  const out = [];
  if (!exists(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!skip.includes(e.name)) out.push(...listFiles(full, exts, skip));
    } else if (exts.includes(path.extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

const sourceFiles = (dir) => listFiles(dir, ['.css', '.html', '.js', '.mjs', '.jsx', '.tsx', '.vue'], ['node_modules', '.git', 'reports', 'tests', 'test']);

function fail(...problems) { return { ok: false, problems }; }
const ok = () => ({ ok: true, problems: [] });
const num = (text, re) => { const m = text.match(re); return m ? Number(m[1]) : null; };

/** Shared document hygiene: non-trivial and no unfilled placeholders. */
function docProblems(text, name) {
  const problems = [];
  if (text.trim().length < MIN_DOC_CHARS) problems.push(`${name} is empty or trivially short (<${MIN_DOC_CHARS} chars)`);
  const m = text.match(PLACEHOLDER);
  if (m) problems.push(`${name} contains unfilled placeholder text ("${m[0]}")`);
  return problems;
}

function reqIds(text) { return [...new Set(text.match(/\bREQ-\d+\b/g) || [])]; }

export const GATES = [
  {
    id: 'G1', name: 'Requirements Grilling', files: ['REQUIREMENTS.md'],
    verify: ({ docs }) => {
      const ids = reqIds(docs['REQUIREMENTS.md']);
      return ids.length ? ok() : fail('REQUIREMENTS.md defines no REQ-### identifiers');
    }
  },
  {
    id: 'G2', name: 'Product Discovery', files: ['USER_JOURNEYS.md'],
    verify: ({ docs }) => /journey/i.test(docs['USER_JOURNEYS.md']) ? ok() : fail('USER_JOURNEYS.md describes no user journey')
  },
  {
    id: 'G3', name: 'Design Direction', files: ['DESIGN_DIRECTION.md'],
    verify: ({ dir }) => {
      const problems = [];
      for (const f of sourceFiles(dir)) {
        problems.push(...checkAntiSlop(readText(f), f));
      }
      return problems.length ? fail(...problems) : ok();
    }
  },
  {
    id: 'G4', name: 'UX/UI Critique', files: ['UI_CRITIQUE_REPORT.md'],
    verify: ({ docs }) => {
      const t = docs['UI_CRITIQUE_REPORT.md'];
      const problems = [];
      if (num(t, /(\d+)\s*\/\s*40/) === null) problems.push('No heuristic score (N / 40) recorded');
      const p0 = num(t, /P0 Defects:?\**\s*(\d+)/i);
      if (p0 === null) problems.push('P0 defect count not recorded');
      else if (p0 > 0) problems.push(`${p0} open P0 defect(s)`);
      return problems.length ? fail(...problems) : ok();
    }
  },
  {
    id: 'G5', name: 'Google Stitch', files: ['STITCH_DESIGN_SPEC.md'],
    // Stitch is optional, but the spec must say honestly where its screens came from.
    verify: ({ docs }) => {
      const m = docs['STITCH_DESIGN_SPEC.md'].match(/\*\*Source:\*\*\s*(.+)/i);
      if (!m) return fail('STITCH_DESIGN_SPEC.md has no "**Source:**" line (Stitch MCP | Stitch SDK | Manual)');
      return /^(Stitch MCP|Stitch SDK|Manual)\b/i.test(m[1].trim()) ? ok() : fail(`Unrecognised Source "${m[1].trim()}" — use Stitch MCP, Stitch SDK or Manual`);
    }
  },
  { id: 'G6', name: 'Frontend Architecture', files: ['ARCHITECTURE.md'], verify: () => ok() },
  {
    id: 'G7', name: 'TDD Verification', files: ['REQUIREMENTS.md', 'TEST_TRACEABILITY_MATRIX.md'],
    verify: ({ dir, docs }) => {
      const ids = reqIds(docs['REQUIREMENTS.md']);
      const rows = docs['TEST_TRACEABILITY_MATRIX.md'].split(/\r?\n/).filter(l => l.trim().startsWith('|'));
      const testFiles = listFiles(dir, ['.js', '.mjs', '.ts', '.py'], ['node_modules', '.git', 'reports']).map(f => path.basename(f));
      const problems = [];
      for (const id of ids) {
        const row = rows.find(r => r.includes(id));
        if (!row) { problems.push(`${id} has no row in TEST_TRACEABILITY_MATRIX.md`); continue; }
        if (!/\bPASSED\b/.test(row)) problems.push(`${id} is not marked PASSED`);
        const ref = row.match(/([\w.-]+\.(?:test|spec)\.\w+)/);
        if (!ref) problems.push(`${id} references no test file`);
        else if (!testFiles.includes(ref[1])) problems.push(`${id} references missing test file ${ref[1]}`);
      }
      return problems.length ? fail(...problems) : ok();
    }
  },
  {
    id: 'G8', name: 'Motion Quality', files: ['MOTION_SPECIFICATION.md'],
    verify: ({ dir }) => {
      const css = listFiles(dir, ['.css']).map(readText).join('\n');
      const problems = [];
      if (!/prefers-reduced-motion/.test(css)) problems.push('No prefers-reduced-motion handling in project CSS');
      for (const line of css.split(/\r?\n/)) {
        if (!/(transition|animation|duration)/i.test(line) || /infinite/i.test(line)) continue;
        for (const m of line.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
          const ms = m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
          if (ms > MAX_MOTION_MS) problems.push(`Animation duration ${m[0]} exceeds ${MAX_MOTION_MS}ms: ${line.trim()}`);
        }
      }
      return problems.length ? fail(...problems) : ok();
    }
  },
  {
    id: 'G9', name: 'Browser QA', files: ['BROWSER_QA_REPORT.md'],
    verify: ({ dir }) => {
      const p = path.join(dir, 'reports', 'browser-qa', 'browser-qa.json');
      if (!exists(p)) return fail('No machine evidence: reports/browser-qa/browser-qa.json (run `npm run test:browser` against this project)');
      let r;
      try { r = JSON.parse(readText(p)); } catch { return fail('browser-qa.json is not valid JSON'); }
      const problems = [];
      if (r.tool !== 'playwright-chromium') problems.push('browser-qa.json was not produced by the Playwright validator');
      if (r.passed !== true) problems.push('Recorded browser run did not pass');
      if (r.viewportsTested !== 6) problems.push(`Browser run covered ${r.viewportsTested} viewports, 6 required`);
      if (!r.sourceHash) problems.push('browser-qa.json has no sourceHash');
      else if (r.sourceHash !== hashProjectSources(dir)) problems.push('Stale evidence: project sources changed since the browser run — re-run `npm run test:browser`');
      return problems.length ? fail(...problems) : ok();
    }
  },
  {
    id: 'G10', name: 'Security Audit', files: ['SECURITY_AUDIT_REPORT.md'],
    verify: ({ docs }) => {
      const t = docs['SECURITY_AUDIT_REPORT.md'];
      const problems = [];
      for (const sev of ['Critical', 'High']) {
        const n = num(t, new RegExp(`${sev} Vulnerabilities:?\\**\\s*(\\d+)`, 'i'));
        if (n === null) problems.push(`${sev} finding count not recorded`);
        else if (n > 0) problems.push(`${n} open ${sev} finding(s)`);
      }
      if (!/STRIDE/i.test(t)) problems.push('No STRIDE threat model');
      return problems.length ? fail(...problems) : ok();
    }
  },
  {
    id: 'G11', name: 'Web Performance', files: ['PERFORMANCE_AUDIT_REPORT.md'],
    verify: ({ docs }) => {
      const rows = docs['PERFORMANCE_AUDIT_REPORT.md'].split(/\r?\n/).filter(l => l.trim().startsWith('|'));
      const problems = [];
      for (const metric of ['LCP', 'INP', 'CLS']) {
        const row = rows.find(r => r.includes(metric));
        if (!row) problems.push(`${metric} not reported`);
        else if (!/\[(STATIC OBSERVATION|LAB MEASURED|FIELD DATA)\]/i.test(row)) problems.push(`${metric} is not classified [STATIC OBSERVATION]/[LAB MEASURED]/[FIELD DATA] (metric honesty)`);
      }
      return problems.length ? fail(...problems) : ok();
    }
  },
  {
    id: 'G12', name: 'Accessibility & SEO', files: ['SEO_REPORT.md', 'ACCESSIBILITY_REPORT.md'],
    verify: ({ docs }) => {
      const problems = [];
      if (/\[(FAIL|FAILED)\]|- \[ \]/i.test(docs['SEO_REPORT.md'] + docs['ACCESSIBILITY_REPORT.md'])) problems.push('SEO/Accessibility reports contain failed or unchecked items');
      return problems.length ? fail(...problems) : ok();
    }
  },
  {
    id: 'G13', name: 'Production Release', files: ['RELEASE_CHECKLIST.md'],
    verify: ({ docs, priorFailures }) => {
      const problems = [];
      if (priorFailures.length) problems.push(`Cannot release while gates fail: ${priorFailures.join(', ')}`);
      if (/- \[ \]/.test(docs['RELEASE_CHECKLIST.md'])) problems.push('Release checklist has unchecked items');
      if (!/sign-?off/i.test(docs['RELEASE_CHECKLIST.md'])) problems.push('No release sign-off recorded');
      return problems.length ? fail(...problems) : ok();
    }
  }
];

/** Evaluate all gates against a project directory. Pure: no console output. */
export function verifyGates(targetDir = SAMPLE_PROJECT) {
  const dir = path.resolve(targetDir);
  const results = [];
  const failedSoFar = [];

  for (const gate of GATES) {
    const docs = {};
    const problems = [];
    for (const f of gate.files) {
      const p = path.join(dir, f);
      if (!exists(p)) { problems.push(`Missing evidence file ${f}`); continue; }
      docs[f] = readText(p);
      problems.push(...docProblems(docs[f], f));
    }
    let evidence = gate.files.map(f => path.join(dir, f)).filter(exists);
    if (problems.length === 0) {
      const v = gate.verify({ dir, docs, priorFailures: [...failedSoFar] });
      problems.push(...v.problems);
    }
    const passed = problems.length === 0;
    if (!passed) failedSoFar.push(gate.id);
    results.push({ gate: gate.id, name: gate.name, status: passed ? 'PASSED' : 'FAILED', problems, evidence });
  }

  const passed = results.filter(r => r.status === 'PASSED').length;
  return { dir, passed, failed: results.length - passed, total: results.length, results };
}
