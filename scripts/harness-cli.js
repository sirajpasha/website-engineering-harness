#!/usr/bin/env node
/**
 * Universal Website Engineering Harness Master CLI Runner
 * Compatible with Claude Code CLI, Gemini CLI / Antigravity, OpenAI Codex / Copilot, Cursor, Windsurf, or Terminal.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEnvironmentAudit } from './environment-audit/audit-environment.js';
import { validateAgents } from './agent-validation/validate-agents.js';
import { validateSkills } from './skill-validation/validate-skills.js';
import { validateMCP } from './mcp-validation/validate-mcp.js';
import { checkGates } from './quality-gates/check-gates.js';
import { verifyTraceability } from './traceability/verify-traceability.js';
import { validateBrowser } from './browser-validation/validate-browser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase().replace(/^--?/, '') : 'help';

function showHelp() {
  console.log(`
===================================================================
  UNIVERSAL WEBSITE ENGINEERING, DESIGN & QUALITY HARNESS (v2.0.0)
===================================================================

Usage:
  node scripts/harness-cli.js <command> [options]
  npm run harness <command>

Core Inspection Commands:
  audit                Run full environment and runtime capability audit
  validate             Validate all 16 agents, skill registry, and MCP bindings
  validate:agents      Verify the 16 specialized agent definitions
  validate:skills      Verify skill registry, governance policy, and wrappers
  validate:mcp         Verify Model Context Protocol configuration (mcp.json)
  validate:trace       Verify Requirement-to-Test Traceability Matrix
  gates, gate          Run Quality Gate Audit across G1 through G13
  test:browser         Run browser validation across the 6 mandatory viewports

Workflow Commands (Simulate/Route to Agent):
  init                 Initialize project scaffolding & environment audit
  grill                Invoke AGENT 02 (Requirement Grilling Specialist)
  discover             Invoke AGENT 03 (Product Discovery Specialist)
  design               Invoke AGENT 04 (Design Art Director - Taste Skill)
  critique             Invoke AGENT 05 (UX/UI Designer - Impeccable)
  stitch               Invoke AGENT 06 (Google Stitch Design Engineer)
  build                Invoke AGENT 08/09 (Frontend Architect & Implementation)
  tdd                  Invoke AGENT 10 (TDD & Test Engineering Specialist)
  motion               Invoke AGENT 07 (Motion & Interaction Engineer)
  security             Invoke AGENT 12 (Security Auditor - Addy Osmani Standard)
  perf                 Invoke AGENT 13 (Web Performance Auditor)
  release              Invoke AGENT 16 (Production Readiness & Release Reviewer)

General:
  help, --help         Show this documentation
`);
}

async function main() {
  switch (command) {
    case 'audit':
      runEnvironmentAudit();
      break;

    case 'validate':
    case 'validate:all':
      console.log('>>> RUNNING COMPREHENSIVE HARNESS SELF-VALIDATION <<<\n');
      const aRes = validateAgents();
      const sRes = validateSkills();
      const mRes = validateMCP();
      const tRes = verifyTraceability();
      const gRes = checkGates();

      console.log('\n====================================================');
      console.log('  OVERALL HARNESS SELF-VALIDATION SUMMARY');
      console.log('====================================================');
      console.log(`- Agents:        ${aRes.passed}/${aRes.total} Passed`);
      console.log(`- Skills:        ${sRes.passed}/${sRes.total} Passed`);
      console.log(`- MCP Config:    ${mRes.valid ? 'VALID' : 'INVALID'}`);
      console.log(`- Traceability:  ${tRes.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`- Quality Gates: ${gRes.passed}/${gRes.total} Gates Verified`);
      console.log('====================================================\n');
      break;

    case 'validate:agents':
      validateAgents();
      break;

    case 'validate:skills':
      validateSkills();
      break;

    case 'validate:mcp':
      validateMCP();
      break;

    case 'validate:trace':
      verifyTraceability();
      break;

    case 'gate':
    case 'gates':
      checkGates();
      break;

    case 'test:browser':
    case 'test':
      await validateBrowser();
      break;

    case 'init':
      console.log('>>> Initializing Universal Website Harness Scaffolding <<<');
      runEnvironmentAudit();
      console.log('\n[✔] Project environment ready. Proceed to requirement grilling via "/website-grill".');
      break;

    case 'grill':
      console.log('>>> [AGENT 02: Requirement Grilling Specialist] <<<');
      console.log('Loading Matt Pocock Grilling skills & Addy Osmani interview-me...');
      console.log('Action: Interrogate business goals and resolve critical ambiguity in REQUIREMENTS.md');
      break;

    case 'design':
      console.log('>>> [AGENT 04: Design Art Director] <<<');
      console.log('Loading Taste Skill (Leonxlnx/taste-skill)...');
      console.log('Action: Enforcing anti-slop visual laws. Generating DESIGN_TOKENS.json and DESIGN_DIRECTION.md');
      break;

    case 'critique':
      console.log('>>> [AGENT 05: UX/UI Design Specialist] <<<');
      console.log('Loading Impeccable (pbakaus/impeccable) 24-command design vocabulary...');
      console.log('Action: Executing 10-heuristic usability critique scored out of 40.');
      break;

    case 'security':
    case 'audit:security':
      console.log('>>> [AGENT 12: Security Auditor] <<<');
      console.log('Loading Addy Osmani Security Auditor standard...');
      console.log('Action: Auditing OWASP Top 10 vulnerabilities, secrets scanning, and STRIDE threat modeling.');
      break;

    case 'perf':
    case 'audit:perf':
      console.log('>>> [AGENT 13: Web Performance Auditor] <<<');
      console.log('Loading Addy Osmani Web Performance Auditor standard...');
      console.log('Action: Auditing Core Web Vitals (LCP, INP, CLS) under metric honesty rules.');
      break;

    case 'release':
      console.log('>>> [AGENT 16: Production Readiness & Release Reviewer] <<<');
      console.log('Action: Consolidating Quality Gates G1 through G12...');
      checkGates();
      break;

    case 'help':
    default:
      showHelp();
      break;
  }
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
