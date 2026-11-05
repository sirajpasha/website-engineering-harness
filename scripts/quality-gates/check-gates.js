#!/usr/bin/env node
/**
 * Quality Gates Checker
 * Content-aware verification of Gates G1–G13 (see gate-rules.js), plus machine
 * contracts and monotonic ratchets.
 *
 * Usage: node scripts/quality-gates/check-gates.js [--target <project-dir>]
 * Default target: the current project (or the reference sample when run inside the harness repo).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateContracts } from '../agent-validation/validate-contracts.js';
import { evaluateRatchets, collectCurrentMetrics, baselinesPathFor } from '../ratchets/check-ratchet.js';
import { verifyGates, HARNESS_ROOT } from './gate-rules.js';
import { defaultTarget } from '../lib/paths.js';

export function checkGates(targetDir = defaultTarget()) {
  const verdict = verifyGates(targetDir);

  console.log('====================================================');
  console.log('  QUALITY GATES AUDIT (G1 - G13)');
  console.log(`  Target: ${path.relative(HARNESS_ROOT, verdict.dir) || verdict.dir}`);
  console.log('====================================================\n');

  for (const r of verdict.results) {
    if (r.status === 'PASSED') {
      console.log(`[✔] Gate ${r.gate} (${r.name}): PASSED`);
      console.log(`    Evidence: ${r.evidence.map(e => path.relative(verdict.dir, e)).join(', ')}`);
    } else {
      console.log(`[✖] Gate ${r.gate} (${r.name}): FAILED`);
      r.problems.forEach(p => console.log(`    - ${p}`));
    }
  }

  console.log('\n--- Mechanical Gate: Agent Machine Contracts ---');
  const contractValidation = validateContracts();

  console.log('\n--- Mechanical Gate: Monotonic Quality Ratchets ---');
  // Ratchets are opt-in: a project that has not started them (no baselines file) is not failed for that.
  // Once baselines exist, a regression or an unmeasurable metric fails closed.
  let ratchets = 'satisfied';
  const baselinesPath = baselinesPathFor(verdict.dir);
  if (!fs.existsSync(baselinesPath)) {
    ratchets = 'not-configured';
    console.log('[i] Ratchets not configured for this project (optional). Run `ratchet --update` to start locking measured quality.');
  } else {
    try {
      const ratchetCheck = evaluateRatchets(collectCurrentMetrics(verdict.dir), { updateBaselines: false, baselinesPath });
      ratchets = ratchetCheck.passed ? 'satisfied' : 'failed';
    } catch (err) {
      ratchets = 'failed';
      console.warn(`[✖] Ratchet check could not run: ${err.message}`);
    }
  }
  const ratchetPassed = ratchets !== 'failed';

  const allPassed = verdict.failed === 0 && contractValidation.passed && ratchetPassed;

  console.log('\n====================================================');
  console.log(`  Gate Audit Summary: ${verdict.passed}/${verdict.total} Gates Verified`);
  console.log(`  Machine Contracts:   ${contractValidation.passed ? 'VERIFIED' : 'FAILED'}`);
  console.log(`  Monotonic Ratchets:  ${ratchets === 'satisfied' ? 'SATISFIED' : ratchets === 'not-configured' ? 'NOT CONFIGURED (optional)' : 'REGRESSION OR UNMEASURED'}`);
  console.log(`  Overall Compliance:  ${allPassed ? 'CERTIFIED' : 'ACTION REQUIRED'}`);
  console.log('====================================================\n');

  return { passed: verdict.passed, missing: verdict.failed, total: verdict.total, allPassed, ratchets, results: verdict.results };
}

if (process.argv[1] && process.argv[1].endsWith('check-gates.js')) {
  const i = process.argv.indexOf('--target');
  const target = i >= 0 ? process.argv[i + 1] : undefined;
  const result = checkGates(target);
  process.exit(result.allPassed ? 0 : 1);
}
