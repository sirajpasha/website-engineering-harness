/**
 * Benchmark suite for the harness: representative website specifications.
 *
 * What this MEASURES (deterministic, offline): whether each spec is classified into the
 * expected lifecycle mode and project sub-type. What it does NOT measure: design quality,
 * functional completeness, security, accessibility, performance, SEO, execution time,
 * token consumption, defect and rework rates. Those need live model runs of the full
 * workflow and are reported as `unmeasured`; no number is ever invented.
 */
import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_ROOT } from './paths.js';
import { classifyRequest } from './classify-request.js';

export const REQUIRED_CATEGORIES = ['corporate', 'e-commerce', 'saas', 'landing', 'portfolio', 'booking', 'customer-portal', 'full-stack', 'redesign', 'enhancement'];
export const METRICS = ['design_quality', 'functional_completeness', 'security', 'accessibility', 'performance', 'seo', 'execution_time', 'token_consumption', 'defect_rate', 'rework_rate'];

export const loadSpecs = (p = path.join(HARNESS_ROOT, 'benchmarks', 'specs.json')) => JSON.parse(fs.readFileSync(p, 'utf8'));

export function validateSuite(specs) {
  const e = [];
  const seen = new Set();
  if (specs.length < 20) e.push(`suite has ${specs.length} specs, need at least 20`);
  for (const s of specs) {
    for (const f of ['id', 'category', 'command', 'brief', 'expect']) if (!s[f]) e.push(`${s.id || '(no id)'}: missing '${f}'`);
    if (seen.has(s.id)) e.push(`${s.id}: duplicate id`);
    seen.add(s.id);
    if (s.expect && (!s.expect.base || !s.expect.subtype)) e.push(`${s.id}: expect needs base and subtype`);
  }
  const cats = new Set(specs.map(s => s.category));
  for (const c of REQUIRED_CATEGORIES) if (!cats.has(c)) e.push(`missing required category '${c}'`);
  return e;
}

export function runClassificationBenchmark(specs) {
  const results = specs.map((s) => {
    const r = classifyRequest({ command: s.command, text: s.brief, hasProject: s.hasProject ?? (s.command !== 'create') });
    const problems = [];
    if (r.base !== s.expect.base) problems.push(`base ${r.base} != ${s.expect.base}`);
    if (r.subtype !== s.expect.subtype) problems.push(`subtype ${r.subtype} != ${s.expect.subtype}`);
    if (s.expect.confidence && r.confidence !== s.expect.confidence) problems.push(`confidence ${r.confidence} != ${s.expect.confidence}`);
    return { id: s.id, category: s.category, ok: problems.length === 0, detail: problems.join('; ') };
  });
  return { total: results.length, passed: results.filter(r => r.ok).length, results };
}

export function buildReport(classification) {
  return {
    classification: { measured: true, total: classification.total, passed: classification.passed },
    metrics: Object.fromEntries(METRICS.map(m => [m, { status: 'unmeasured', reason: 'requires a live end-to-end run of the workflow; not run by the offline benchmark' }])),
  };
}
