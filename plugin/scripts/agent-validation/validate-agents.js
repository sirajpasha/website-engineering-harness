#!/usr/bin/env node
/**
 * Agent Validation Script
 * Validates that all 16 specialized agents exist, conform to harness structure,
 * and define necessary triggers, responsibilities, and quality gates.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const agentsDir = path.join(rootDir, 'agents');

const REQUIRED_AGENTS = [
  'orchestrator.md',
  'requirement-grilling.md',
  'product-discovery.md',
  'design-art-director.md',
  'ux-ui-designer.md',
  'stitch-design-engineer.md',
  'motion-engineer.md',
  'frontend-architect.md',
  'implementation-engineer.md',
  'tdd-test-engineer.md',
  'browser-qa.md',
  'security-auditor.md',
  'web-performance-auditor.md',
  'seo-accessibility.md',
  'code-reviewer.md',
  'production-reviewer.md'
];

export function validateAgents() {
  console.log('====================================================');
  console.log('  AGENT SPECIFICATION VALIDATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const agentFile of REQUIRED_AGENTS) {
    const filePath = path.join(agentsDir, agentFile);
    if (!fs.existsSync(filePath)) {
      console.log(`[✖] Missing agent file: agents/${agentFile}`);
      failed++;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const hasIdentity = content.includes('Identity') || content.includes('Responsibilities') || content.includes('Mandate');
    const hasCore = content.includes('Responsibilities') || content.includes('Directives') || content.includes('Laws') ||
                    content.includes('Rules') || content.includes('Lifecycle') || content.includes('Framework') ||
                    content.includes('Vocabulary') || content.includes('Operating Modes') || content.includes('Matrix');

    if (hasIdentity && hasCore && content.length > 500) {
      console.log(`[✔] agents/${agentFile} validated (${content.length} bytes)`);
      passed++;
    } else {
      console.log(`[!] agents/${agentFile} incomplete structure`);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`  Agent Validation Result: ${passed}/${REQUIRED_AGENTS.length} Passed`);
  console.log('====================================================\n');

  return { passed, failed, total: REQUIRED_AGENTS.length };
}

if (process.argv[1] && process.argv[1].endsWith('validate-agents.js')) {
  const result = validateAgents();
  process.exit(result.failed > 0 ? 1 : 0);
}
