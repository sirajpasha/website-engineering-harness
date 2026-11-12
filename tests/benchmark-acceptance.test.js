import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadSpecs, validateSuite, runClassificationBenchmark, buildReport, METRICS, REQUIRED_CATEGORIES } from '../scripts/lib/benchmark.js';
import { loadScenarios, runAcceptance } from '../scripts/evals/run-acceptance.js';
import { classifyRequest } from '../scripts/lib/classify-request.js';

describe('benchmark suite', () => {
  const specs = loadSpecs();

  test('has at least 20 specs covering every required category with unique ids', () => {
    assert.deepEqual(validateSuite(specs), []);
    assert.ok(specs.length >= 20);
    const cats = new Set(specs.map(s => s.category));
    for (const c of REQUIRED_CATEGORIES) assert.ok(cats.has(c), `category ${c}`);
    assert.equal(new Set(specs.map(s => s.id)).size, specs.length);
  });

  test('every spec is classified as expected by the deterministic classifier', () => {
    const r = runClassificationBenchmark(specs);
    assert.deepEqual(r.results.filter(x => !x.ok).map(x => `${x.id}: ${x.detail}`), []);
    assert.equal(r.total, specs.length);
  });

  test('a wrong expectation is reported as a failure (the benchmark can fail)', () => {
    const bad = [{ ...specs[0], expect: { base: 'REDESIGN', subtype: 'LANDING_PAGE' } }];
    assert.equal(runClassificationBenchmark(bad).results[0].ok, false);
  });

  test('report never invents live metrics: every unmeasured dimension is labelled unmeasured', () => {
    const rep = buildReport(runClassificationBenchmark(specs));
    for (const m of METRICS) assert.equal(rep.metrics[m].status, 'unmeasured', m);
    assert.ok(!JSON.stringify(rep.metrics).match(/\d+(\.\d+)?\s?(ms|%|tokens)/));
    assert.equal(rep.classification.measured, true);
  });

  test('portfolio and SaaS wording is recognised (classifier rules added with the suite)', () => {
    assert.equal(classifyRequest({ command: 'create', text: "A photographer's portfolio with a gallery" }).subtype, 'CONTENT_WEBSITE');
    assert.equal(classifyRequest({ command: 'create', text: 'A SaaS product with pricing and sign up' }).subtype, 'FULL_STACK_MVP');
  });
});

describe('acceptance scenarios (20)', () => {
  const scenarios = loadScenarios();

  test('all 20 numbered scenarios are present exactly once', () => {
    assert.deepEqual(scenarios.map(s => s.n).sort((a, b) => a - b), Array.from({ length: 20 }, (_, i) => i + 1));
  });

  test('every automated or partial scenario passes its check', () => {
    const r = runAcceptance(scenarios);
    assert.deepEqual(r.results.filter(x => x.ran && !x.ok).map(x => `#${x.n}: ${x.detail}`), []);
  });

  test('coverage is reported honestly: manual and gap scenarios are listed, not counted as passed', () => {
    const r = runAcceptance(scenarios);
    assert.equal(r.summary.automated + r.summary.partial + r.summary.manual + r.summary.gap, 20);
    assert.ok(r.summary.manual >= 1);
    assert.ok(r.results.filter(x => x.kind === 'manual' || x.kind === 'gap').every(x => x.ran === false));
    assert.equal(r.summary.passed, r.results.filter(x => x.ran && x.ok).length);
  });

  test('a scenario whose check fails is reported (the runner can fail)', () => {
    const failing = { 'stitch-fallback': () => { throw new Error('forced failure'); } };
    const r = runAcceptance(scenarios, { handlers: failing });
    const row = r.results.find(x => x.n === 10);
    assert.equal(row.ran, true);
    assert.equal(row.ok, false);
    assert.match(row.detail, /forced failure/);
    assert.equal(r.summary.passed, r.results.filter(x => x.ran && x.ok).length);
  });

  test('scenario 20 (production approval) is recorded as a gap unless mechanically enforced', () => {
    const s = scenarios.find(x => x.n === 20);
    assert.ok(['gap', 'automated', 'partial'].includes(s.kind));
    if (s.kind === 'gap') assert.match(s.note, /not (mechanically )?enforced/i);
  });
});
