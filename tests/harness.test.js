/**
 * Automated Harness Integration Test
 * Verifies that all configuration files, agent files, skill files, and quality gates
 * can be verified programmatically by any automated test runner.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { runEnvironmentAudit } from '../scripts/environment-audit/audit-environment.js';
import { validateAgents } from '../scripts/agent-validation/validate-agents.js';
import { validateSkills } from '../scripts/skill-validation/validate-skills.js';
import { validateMCP } from '../scripts/mcp-validation/validate-mcp.js';
import { checkGates } from '../scripts/quality-gates/check-gates.js';
import { verifyTraceability } from '../scripts/traceability/verify-traceability.js';

describe('Harness Architecture & Integrity Tests', () => {
  test('environment audit finds configuration files', () => {
    const audit = runEnvironmentAudit();
    assert.strictEqual(audit.configPass, audit.totalConfigs, 'All core config files must exist');
  });

  test('all 16 specialized agents pass validation', () => {
    const agentValidation = validateAgents();
    assert.strictEqual(agentValidation.passed, 16, 'All 16 agents must pass validation');
    assert.strictEqual(agentValidation.failed, 0, 'Zero agents should fail validation');
  });

  test('skills ecosystem and registry are complete', () => {
    const skillValidation = validateSkills();
    assert.strictEqual(skillValidation.passed, skillValidation.total, 'All skill docs must exist');
    assert.strictEqual(skillValidation.registryComplete, true, 'Core registry entries must be present');
  });

  test('MCP server configurations are valid', () => {
    const mcp = validateMCP();
    assert.strictEqual(mcp.valid, true, 'mcp.json must be valid JSON');
    assert.strictEqual(mcp.hasPlaywright, true, 'Playwright MCP must be configured');
    assert.strictEqual(mcp.hasStitch, true, 'Google Stitch MCP must be configured');
  });

  test('requirement-to-test traceability matrix is verified', () => {
    const trace = verifyTraceability();
    assert.strictEqual(trace.passed, true);
    assert.ok(trace.count >= 8, 'At least 8 requirement links must be tracked');
  });

  test('all 13 quality gates pass verification on sample project', () => {
    const gates = checkGates();
    assert.strictEqual(gates.passed, 13, 'All 13 gates must be verified');
    assert.strictEqual(gates.missing, 0, 'Zero gates should be pending');
  });
});
