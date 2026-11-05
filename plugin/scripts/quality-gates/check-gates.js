#!/usr/bin/env node
/**
 * Quality Gates Checker
 * Content-aware verification of Gates G1–G13 (see gate-rules.js), plus machine
 * contracts and monotonic ratchets.
 *
 * Usage: node scripts/quality-gates/check-gates.js [--target <project-dir>]
 * Default target: the current project (or the reference sample when run inside the harness repo).
 */

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
  let ratchetPassed = true;
  try {
    const ratchetCheck = evaluateRatchets(collectCurrentMetrics(verdict.dir), { updateBaselines: false, baselinesPath: baselinesPathFor(verdict.dir) });
    ratchetPassed = ratchetCheck.passed;
  } catch (err) {
    ratchetPassed = false;
    console.warn(`[✖] Ratchet check could not run: ${err.message}`);
  }

  const allPassed = verdict.failed === 0 && contractValidation.passed && ratchetPassed;

  console.log('\n====================================================');
  console.log(`  Gate Audit Summary: ${verdict.passed}/${verdict.total} Gates Verified`);
  console.log(`  Machine Contracts:   ${contractValidation.passed ? 'VERIFIED' : 'FAILED'}`);
  console.log(`  Monotonic Ratchets:  ${ratchetPassed ? 'SATISFIED' : 'REGRESSION DETECTED'}`);
  console.log(`  Overall Compliance:  ${allPassed ? 'CERTIFIED' : 'ACTION REQUIRED'}`);
  console.log('====================================================\n');

  return { passed: verdict.passed, missing: verdict.failed, total: verdict.total, allPassed, results: verdict.results };
}

if (process.argv[1] && process.argv[1].endsWith('check-gates.js')) {
  const i = process.argv.indexOf('--target');
  const target = i >= 0 ? process.argv[i + 1] : undefined;
  const result = checkGates(target);
  process.exit(result.allPassed ? 0 : 1);
}
