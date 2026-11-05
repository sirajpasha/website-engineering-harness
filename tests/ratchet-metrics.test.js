import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectCurrentMetrics,
  evaluateRatchets,
  parseCoverage,
  seedBaselines
} from '../scripts/ratchets/check-ratchet.js';
import { SAMPLE_PROJECT } from '../scripts/quality-gates/gate-rules.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = (p = 'rm-') => fs.mkdtempSync(path.join(os.tmpdir(), p));
const quiet = { log: () => {} };

describe('parseCoverage', () => {
  test('extracts the all-files line percentage from node test output', () => {
    const out = '# all files | 32.74 |    76.92 |   66.67 | \n';
    assert.equal(parseCoverage(out), 32.74);
  });
  test('returns undefined when there is no coverage report', () => {
    assert.equal(parseCoverage('# tests 3\n# pass 3\n'), undefined);
  });
});

describe('collectCurrentMetrics reports only what it measures', () => {
  test('an empty project yields no fabricated metrics', () => {
    const m = collectCurrentMetrics(tmp());
    assert.deepEqual(Object.keys(m).filter(k => m[k] !== undefined), []);
  });

  test('sample project: real values from sources, tests and the browser report', () => {
    const m = collectCurrentMetrics(SAMPLE_PROJECT);
    assert.ok(m.max_js_bundle_kb > 0 && m.max_js_bundle_kb < 50);
    assert.ok(m.max_css_bundle_kb > 0);
    assert.ok(m.test_coverage_pct > 0 && m.test_coverage_pct <= 100);
    assert.notEqual(m.test_coverage_pct, 95.0, 'coverage must be measured, not hardcoded');
    assert.equal(m.viewports_passed, 6);
    assert.ok(typeof m.core_web_vitals_lcp_ms === 'number');
    assert.ok(typeof m.core_web_vitals_cls === 'number');
    assert.ok(Number.isInteger(m.accessibility_violations));
  });

  test('browser metrics are dropped when the browser report is stale', () => {
    const d = tmp();
    fs.cpSync(SAMPLE_PROJECT, d, { recursive: true });
    fs.appendFileSync(path.join(d, 'src', 'app.js'), '\n// edited after QA\n');
    const m = collectCurrentMetrics(d);
    for (const k of ['viewports_passed', 'core_web_vitals_lcp_ms', 'core_web_vitals_cls', 'accessibility_violations']) {
      assert.equal(m[k], undefined, k);
    }
    assert.ok(m.max_js_bundle_kb > 0);
  });
});

describe('browser report carries real vitals and axe results', () => {
  test('sample browser-qa.json has lab vitals and an a11y section', () => {
    const j = JSON.parse(fs.readFileSync(path.join(SAMPLE_PROJECT, 'reports/browser-qa/browser-qa.json'), 'utf8'));
    assert.equal(j.vitals.classification, 'LAB MEASURED');
    assert.ok(typeof j.vitals.lcpMs === 'number' && typeof j.vitals.cls === 'number');
    assert.equal(j.a11y.engine, 'axe-core');
    assert.ok(Number.isInteger(j.a11y.violations));
  });
});

describe('evaluateRatchets with explicit baselines', () => {
  function baselinesFile(extra = {}) {
    const p = path.join(tmp(), 'baselines.json');
    fs.writeFileSync(p, JSON.stringify({
      ratchets: {
        test_coverage_pct: { name: 'Coverage', baseline: 50, direction: 'increase', unit: '%', tolerance: 0 },
        max_js_bundle_kb: { name: 'JS', baseline: 10, direction: 'decrease', unit: 'kB', tolerance: 0 },
        ...extra
      }
    }));
    return p;
  }
  test('unmeasured metric fails closed', () => {
    const r = evaluateRatchets({ test_coverage_pct: 60 }, { baselinesPath: baselinesFile(), ...quiet });
    assert.equal(r.passed, false);
    assert.equal(r.results.find(x => x.key === 'max_js_bundle_kb').status, 'UNMEASURED');
  });
  test('regression fails, improvement advances baseline monotonically', () => {
    const p = baselinesFile();
    assert.equal(evaluateRatchets({ test_coverage_pct: 40, max_js_bundle_kb: 9 }, { baselinesPath: p, ...quiet }).passed, false);
    const r = evaluateRatchets({ test_coverage_pct: 70, max_js_bundle_kb: 8 }, { baselinesPath: p, updateBaselines: true, ...quiet });
    assert.equal(r.passed, true);
    const saved = JSON.parse(fs.readFileSync(p, 'utf8')).ratchets;
    assert.equal(saved.test_coverage_pct.baseline, 70);
    assert.equal(saved.max_js_bundle_kb.baseline, 8);
    // a later worse value must not loosen the baseline
    evaluateRatchets({ test_coverage_pct: 55, max_js_bundle_kb: 9 }, { baselinesPath: p, updateBaselines: true, ...quiet });
    assert.equal(JSON.parse(fs.readFileSync(p, 'utf8')).ratchets.test_coverage_pct.baseline, 70);
  });
  test('missing baselines file throws', () => {
    assert.throws(() => evaluateRatchets({}, { baselinesPath: path.join(tmp(), 'nope.json'), ...quiet }));
  });
});

describe('seedBaselines', () => {
  test('creates baselines equal to measured values, never overwrites', () => {
    const p = path.join(tmp(), '.harness', 'baselines.json');
    const created = seedBaselines({ test_coverage_pct: 33.5, max_js_bundle_kb: 4.2 }, p);
    assert.equal(created, true);
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.equal(j.ratchets.test_coverage_pct.baseline, 33.5);
    assert.equal(j.ratchets.test_coverage_pct.direction, 'increase');
    assert.equal(j.ratchets.max_js_bundle_kb.direction, 'decrease');
    assert.equal(seedBaselines({ test_coverage_pct: 99 }, p), false);
    assert.equal(JSON.parse(fs.readFileSync(p, 'utf8')).ratchets.test_coverage_pct.baseline, 33.5);
  });
});
