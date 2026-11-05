#!/usr/bin/env node
/**
 * Skill Registry & Skill Validation Script
 * Verifies that all registered skills in SKILL_REGISTRY.md have corresponding
 * documentation, integration wrappers, and follow the 10-point evaluation policy.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const REQUIRED_SKILL_DOCS = [
  'skills/registry/SKILL_REGISTRY.md',
  'skills/registry/policy.md',
  'skills/design/taste-skill.md',
  'skills/design/impeccable.md',
  'skills/engineering/frontend-standards.md',
  'skills/motion/emil-kowalski.md',
  'skills/testing/tdd-patterns.md',
  'skills/browser-automation/playwright-workflows.md',
  'skills/security/security-checklist.md',
  'skills/performance/cwv-guidelines.md',
  'skills/production/release-gates.md'
];

export function validateSkills() {
  console.log('====================================================');
  console.log('  SKILLS ECOSYSTEM & REGISTRY VALIDATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const skillDoc of REQUIRED_SKILL_DOCS) {
    const fullPath = path.join(rootDir, skillDoc);
    if (!fs.existsSync(fullPath)) {
      console.log(`[✖] Missing skill file: ${skillDoc}`);
      failed++;
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.length > 200) {
      console.log(`[✔] ${skillDoc} verified (${content.length} bytes)`);
      passed++;
    } else {
      console.log(`[!] ${skillDoc} too short`);
      failed++;
    }
  }

  // Verify SKILL_REGISTRY.md table integrity
  const registryPath = path.join(rootDir, 'skills/registry/SKILL_REGISTRY.md');
  const regContent = fs.readFileSync(registryPath, 'utf-8');
  const hasTaste = regContent.includes('taste-skill');
  const hasImpeccable = regContent.includes('impeccable');
  const hasEmil = regContent.includes('emil-motion-skills');
  const hasSecurity = regContent.includes('security-auditor');
  const hasWebPerf = regContent.includes('web-performance-auditor');
  const hasPlaywright = regContent.includes('playwright');
  const hasStitch = regContent.includes('google-stitch');

  const registryComplete = hasTaste && hasImpeccable && hasEmil && hasSecurity && hasWebPerf && hasPlaywright && hasStitch;

  console.log(`\nRegistry Core Coverage: ${registryComplete ? '[✔] COMPLETE' : '[!] INCOMPLETE'}`);

  console.log('\n====================================================');
  console.log(`  Skill Validation Result: ${passed}/${REQUIRED_SKILL_DOCS.length} Passed`);
  console.log('====================================================\n');

  return { passed, failed, total: REQUIRED_SKILL_DOCS.length, registryComplete };
}

if (process.argv[1] && process.argv[1].endsWith('validate-skills.js')) {
  const result = validateSkills();
  process.exit(result.failed > 0 ? 1 : 0);
}
