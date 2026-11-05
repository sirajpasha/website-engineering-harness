#!/usr/bin/env node
/**
 * Monotonic Quality Ratchets
 *
 * Metrics are MEASURED from the target project — nothing is defaulted or
 * assumed. A metric that cannot be measured is reported as UNMEASURED, and an
 * unmeasured ratchet fails the check (fail closed).
 *
 *   test_coverage_pct          node --test --experimental-test-coverage (line %)
 *   max_js_bundle_kb / css     raw size of shipped JS / CSS source files
 *   viewports_passed           reports/browser-qa/browser-qa.json  (Playwright)
 *   core_web_vitals_lcp_ms/cls reports/browser-qa/browser-qa.json  (LAB MEASURED)
 *   accessibility_violations   reports/browser-qa/browser-qa.json  (axe-core)
 *
 * Browser-derived metrics are discarded when the report is stale (its source
 * hash no longer matches the project) or was not produced by the validator.
 *
 * Usage: node scripts/ratchets/check-ratchet.js [--target <dir>] [--update]
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hashProjectSources } from '../quality-gates/evidence.js';
import { defaultTarget } from '../lib/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');
const SAMPLE_DIR = path.join(rootDir, 'examples', 'sample-website');
const DEFAULT_BASELINES = path.join(rootDir, '.harness', 'baselines.json');

const SKIP_DIRS = new Set(['node_modules', '.git', 'reports', 'tests', 'test', '.harness', 'coverage', '.playwright-artifacts']);

function listFiles(dir, exts, skip = SKIP_DIRS) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!skip.has(e.name)) out.push(...listFiles(full, exts, skip));
    } else if (exts.includes(path.extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

const sumKb = (files) => Number((files.reduce((n, f) => n + fs.statSync(f).size, 0) / 1024).toFixed(2));

/** Extract the "all files" line-coverage percentage from `node --test` output. */
export function parseCoverage(output) {
  const m = String(output).match(/all files\s*\|\s*([\d.]+)\s*\|/i);
  return m ? Number(m[1]) : undefined;
}

/** A nested `node --test` inherits NODE_TEST_CONTEXT when run under the test runner and then emits no coverage report. */
function cleanTestEnv() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

function measureCoverage(projectDir) {
  if (!fs.existsSync(path.join(projectDir, 'src'))) return undefined;
  const tests = listFiles(path.join(projectDir, 'tests'), ['.js', '.mjs'], new Set(['node_modules']))
    .filter(f => /\.(test|spec)\.m?js$/.test(f));
  if (!tests.length) return undefined;
  const run = spawnSync(
    process.execPath,
    ['--test', '--experimental-test-coverage', '--test-coverage-include=src/**', ...tests],
    { cwd: projectDir, encoding: 'utf8', env: cleanTestEnv() }
  );
  if (run.status !== 0) return undefined; // failing tests earn no coverage credit
  return parseCoverage(run.stdout + run.stderr);
}

function readBrowserReport(projectDir) {
  const p = path.join(projectDir, 'reports', 'browser-qa', 'browser-qa.json');
  if (!fs.existsSync(p)) return null;
  try {
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (r.tool !== 'playwright-chromium' || !r.sourceHash) return null;
    if (r.sourceHash !== hashProjectSources(projectDir)) return null; // stale
    return r;
  } catch {
    return null;
  }
}

/** Measure ratchet metrics for a project. Unmeasurable metrics are left undefined. */
export function collectCurrentMetrics(targetDir = defaultTarget()) {
  const dir = path.resolve(rootDir, targetDir);
  const m = {};
  if (!fs.existsSync(dir)) return m;

  const hasSite = listFiles(dir, ['.html']).length > 0;
  if (hasSite) {
    m.max_js_bundle_kb = sumKb(listFiles(dir, ['.js', '.mjs']));
    m.max_css_bundle_kb = sumKb(listFiles(dir, ['.css']));
  }
  m.test_coverage_pct = measureCoverage(dir);

  const report = readBrowserReport(dir);
  if (report) {
    m.viewports_passed = report.results.filter(r => r.passed).length;
    if (report.vitals) {
      m.core_web_vitals_lcp_ms = report.vitals.lcpMs;
      m.core_web_vitals_cls = report.vitals.cls;
    }
    if (report.a11y) m.accessibility_violations = report.a11y.violations;
  }
  return m;
}

const RATCHET_DEFS = {
  test_coverage_pct: { name: 'Test Suite Line Coverage', direction: 'increase', unit: '%', tolerance: 0 },
  max_js_bundle_kb: { name: 'Client JS Size', direction: 'decrease', unit: 'kB', tolerance: 0.5 },
  max_css_bundle_kb: { name: 'Client CSS Size', direction: 'decrease', unit: 'kB', tolerance: 0.25 },
  core_web_vitals_lcp_ms: { name: 'Largest Contentful Paint (lab)', direction: 'decrease', unit: 'ms', tolerance: 250 },
  core_web_vitals_cls: { name: 'Cumulative Layout Shift (lab)', direction: 'decrease', unit: 'score', tolerance: 0.01 },
  viewports_passed: { name: 'Responsive Viewport Pass Count', direction: 'increase', unit: 'viewports', tolerance: 0 },
  accessibility_violations: { name: 'axe WCAG 2.2 AA Violation Rules', direction: 'decrease', unit: 'violations', tolerance: 0 }
};

/** Create baselines equal to the measured values. Never overwrites an existing file. */
export function seedBaselines(metrics, baselinesPath) {
  if (fs.existsSync(baselinesPath)) return false;
  const ratchets = {};
  for (const [key, def] of Object.entries(RATCHET_DEFS)) {
    if (typeof metrics[key] === 'number') ratchets[key] = { ...def, baseline: metrics[key] };
  }
  fs.mkdirSync(path.dirname(baselinesPath), { recursive: true });
  fs.writeFileSync(baselinesPath, JSON.stringify({
    version: '2.0.0',
    last_updated: new Date().toISOString(),
    description: 'Monotonic quality ratchets seeded from measured values. Metrics may only hold or improve.',
    ratchets
  }, null, 2), 'utf8');
  return true;
}

export function baselinesPathFor(targetDir = defaultTarget()) {
  return path.join(path.resolve(rootDir, targetDir), '.harness', 'baselines.json');
}

export function evaluateRatchets(currentMetrics, { updateBaselines = false, baselinesPath = DEFAULT_BASELINES, log = console.log } = {}) {
  if (!fs.existsSync(baselinesPath)) {
    throw new Error(`Baselines file not found at ${baselinesPath} (create it with: ratchet --update --target <dir>)`);
  }

  const baselineData = JSON.parse(fs.readFileSync(baselinesPath, 'utf8'));
  const results = [];
  let hasRegressions = false;
  let unmeasured = 0;
  let ratchetsAdvanced = 0;

  log(`Evaluating Monotonic Quality Ratchets against ${path.relative(rootDir, baselinesPath) || baselinesPath}...\n`);

  for (const [key, config] of Object.entries(baselineData.ratchets)) {
    const currentVal = currentMetrics[key];
    const { baseline, direction, tolerance = 0, name, unit } = config;

    if (typeof currentVal !== 'number') {
      unmeasured++;
      results.push({ key, name, status: 'UNMEASURED', currentVal: undefined, baseline, detail: 'Not measured — run the tests and `npm run test:browser` first' });
      log(`  [UNMEASURED] ${name}: no measurement available (baseline ${baseline}${unit})`);
      continue;
    }

    let status = 'PASS';
    let detail = '';
    const better = direction === 'increase' ? currentVal > baseline : currentVal < baseline;
    const worse = direction === 'increase' ? currentVal < baseline - tolerance : currentVal > baseline + tolerance;

    if (worse) {
      status = 'REGRESSION';
      hasRegressions = true;
      detail = `Current (${currentVal}${unit}) is worse than baseline (${baseline}${unit})`;
    } else if (better) {
      status = 'IMPROVED';
      ratchetsAdvanced++;
      detail = `Improved (${currentVal}${unit} vs ${baseline}${unit}) - ratchet clicks forward`;
      if (updateBaselines) config.baseline = currentVal;
    } else {
      detail = `Held baseline (${currentVal}${unit} vs ${baseline}${unit})`;
    }

    results.push({ key, name, status, currentVal, baseline, detail });
    const badge = status === 'PASS' ? '[PASS]' : status === 'IMPROVED' ? '[ADVANCE]' : '[REGRESSION]';
    log(`  ${badge.padEnd(12)} ${name}: ${detail}`);
  }

  if (updateBaselines && ratchetsAdvanced > 0) {
    baselineData.last_updated = new Date().toISOString();
    fs.writeFileSync(baselinesPath, JSON.stringify(baselineData, null, 2), 'utf8');
    log(`\n[RATCHET] ${ratchetsAdvanced} baseline(s) monotonically advanced and persisted.`);
  }

  return {
    passed: !hasRegressions && unmeasured === 0,
    hasRegressions,
    unmeasured,
    ratchetsAdvanced,
    results
  };
}

if (process.argv[1] && process.argv[1].endsWith('check-ratchet.js')) {
  const args = process.argv.slice(2);
  const update = args.includes('--update') || args.includes('-u');
  const ti = args.indexOf('--target');
  const target = ti >= 0 ? args[ti + 1] : defaultTarget();

  try {
    const metrics = collectCurrentMetrics(target);
    const bp = baselinesPathFor(target);
    if (update && seedBaselines(metrics, bp)) {
      console.log(`[RATCHET] Seeded new baselines from measured values: ${path.relative(rootDir, bp)}`);
    }
    const outcome = evaluateRatchets(metrics, { updateBaselines: update, baselinesPath: bp });
    if (!outcome.passed) {
      const why = outcome.hasRegressions ? 'Quality regressions detected' : 'Required metrics are unmeasured';
      console.error(`\n[FAIL] Monotonic ratchet check failed: ${why}.`);
      process.exit(1);
    }
    console.log('\n[PASS] All monotonic ratchets satisfied.');
    process.exit(0);
  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    process.exit(1);
  }
}
