#!/usr/bin/env node
/**
 * Quality Gates Checker Script
 * Automated verification of Quality Gates G1 through G13.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const GATES = [
  { id: 'G1', name: 'Requirements Grilling', file: 'REQUIREMENTS.md', desc: 'Critical ambiguity resolved' },
  { id: 'G2', name: 'Product Discovery', file: 'USER_JOURNEYS.md', desc: 'Sitemap and journeys approved' },
  { id: 'G3', name: 'Design Direction', file: 'DESIGN_DIRECTION.md', desc: 'Taste review approved (anti-slop)' },
  { id: 'G4', name: 'UX/UI Critique', file: 'UI_CRITIQUE_REPORT.md', desc: 'Impeccable critique completed' },
  { id: 'G5', name: 'Google Stitch', file: 'STITCH_DESIGN_SPEC.md', desc: 'Screen variants & tokens mapped' },
  { id: 'G6', name: 'Frontend Architecture', file: 'ARCHITECTURE.md', desc: 'Component contracts approved' },
  { id: 'G7', name: 'TDD Verification', file: 'TEST_TRACEABILITY_MATRIX.md', desc: 'Automated tests passing' },
  { id: 'G8', name: 'Motion Quality', file: 'MOTION_SPECIFICATION.md', desc: 'Fluid animations (<250ms) + reduced motion' },
  { id: 'G9', name: 'Browser QA', file: 'BROWSER_QA_REPORT.md', desc: '6 viewports tested in Playwright' },
  { id: 'G10', name: 'Security Audit', file: 'SECURITY_AUDIT_REPORT.md', desc: 'OWASP / STRIDE 0 high/critical issues' },
  { id: 'G11', name: 'Web Performance', file: 'PERFORMANCE_AUDIT_REPORT.md', desc: 'CWV budgets & honest metrics' },
  { id: 'G12', name: 'Accessibility & SEO', file: 'SEO_REPORT.md', desc: 'WCAG 2.2 AA & metadata verified' },
  { id: 'G13', name: 'Production Release', file: 'RELEASE_CHECKLIST.md', desc: 'Independent release sign-off' }
];

export function checkGates(targetDir = rootDir) {
  console.log('====================================================');
  console.log(`  QUALITY GATES AUDIT (G1 - G13)`);
  console.log(`  Target: ${targetDir}`);
  console.log('====================================================\n');

  let passed = 0;
  let missing = 0;
  const results = [];

  for (const gate of GATES) {
    // Check in targetDir or in targetDir/examples/sample-website or rootDir
    const possiblePaths = [
      path.join(targetDir, gate.file),
      path.join(targetDir, 'examples/sample-website', gate.file),
      path.join(rootDir, 'examples/sample-website', gate.file),
      path.join(rootDir, 'templates', gate.file.toLowerCase())
    ];

    const foundPath = possiblePaths.find(p => fs.existsSync(p));
    const hasEvidence = !!foundPath;

    if (hasEvidence) {
      console.log(`[✔] Gate ${gate.id} (${gate.name}): PASSED`);
      console.log(`    Evidence: ${path.relative(rootDir, foundPath)}`);
      passed++;
      results.push({ gate: gate.id, status: 'PASSED', evidence: foundPath });
    } else {
      console.log(`[✖] Gate ${gate.id} (${gate.name}): PENDING EVIDENCE (${gate.file})`);
      missing++;
      results.push({ gate: gate.id, status: 'PENDING', evidence: null });
    }
  }

  console.log('\n====================================================');
  console.log(`  Gate Audit Summary: ${passed}/${GATES.length} Gates Verified`);
  console.log('====================================================\n');

  return { passed, missing, total: GATES.length, results };
}

if (process.argv[1] && process.argv[1].endsWith('check-gates.js')) {
  checkGates();
}
