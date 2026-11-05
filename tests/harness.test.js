/**
 * Automated Harness Integration & Mechanical Safeguard Tests
 * Verifies that all configuration files, agent specifications, machine contracts,
 * guard hooks, cryptographic TDD receipts, monotonic ratchets, and telemetry
 * can be verified programmatically by any automated test runner.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { runEnvironmentAudit } from '../scripts/environment-audit/audit-environment.js';
import { validateAgents } from '../scripts/agent-validation/validate-agents.js';
import { validateContracts } from '../scripts/agent-validation/validate-contracts.js';
import { validateSkills } from '../scripts/skill-validation/validate-skills.js';
import { validateMCP } from '../scripts/mcp-validation/validate-mcp.js';
import { checkGates } from '../scripts/quality-gates/check-gates.js';
import { verifyTraceability } from '../scripts/traceability/verify-traceability.js';
import { inspectWrite, checkSecrets, checkAgentContract } from '../scripts/hooks/pre-write-gate.js';
import { verifyTestModification, countAssertions } from '../scripts/hooks/test-write-lock.js';
import { inspectCommand } from '../scripts/hooks/pre-bash-gate.js';
import { evaluateRatchets, collectCurrentMetrics, baselinesPathFor } from '../scripts/ratchets/check-ratchet.js';
import { checkContextBudget } from '../scripts/telemetry/context-budget.js';
import { diagnoseFailure } from '../scripts/ci/pr-respond.js';

describe('Harness Architecture & Integrity Tests', () => {
  test('environment audit finds configuration files', () => {
    const audit = runEnvironmentAudit();
    assert.strictEqual(audit.configPass, audit.totalConfigs, 'All core config files must exist');
  });

  test('all 16 specialized agents pass markdown validation', () => {
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
    // Stitch is optional and not bundled (the npm package once named here does not exist).
    assert.strictEqual(mcp.stitch, mcp.hasStitch ? 'configured' : 'optional-not-configured');
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

describe('Mechanical Pillar 1: Agent Machine Contracts', () => {
  test('all 16 agent contracts adhere to boundary specifications', () => {
    const contracts = validateContracts();
    assert.strictEqual(contracts.passed, true);
    assert.strictEqual(contracts.valid, 16);
    assert.strictEqual(contracts.errors.length, 0);
  });

  test('code-reviewer is mechanically forbidden from modifying source code', () => {
    const violations = checkAgentContract('code-reviewer', 'src/app.js');
    assert.ok(violations.length > 0, 'code-reviewer must be blocked from writing to src/app.js');
  });

  test('implementation-engineer is allowed to modify source code but not tests', () => {
    const allowed = checkAgentContract('implementation-engineer', 'src/app.js');
    assert.strictEqual(allowed.length, 0, 'implementation-engineer should be allowed to write to src/app.js');

    const blocked = checkAgentContract('implementation-engineer', 'tests/sample-website.test.js');
    assert.ok(blocked.length > 0, 'implementation-engineer must be blocked from writing to tests/');
  });
});

describe('Mechanical Pillar 2: Guard Hooks & Safety Gates', () => {
  test('pre-write gate detects secret leaks', () => {
    const secretContent = "const AWS_KEY = 'AKIAIOSFODNN7EXAMPLE';";
    const violations = checkSecrets(secretContent, 'config.js');
    assert.ok(violations.length > 0, 'AWS Access Key pattern must be detected');
  });

  test('pre-write gate allows safe clean code', () => {
    const safeContent = "export function add(a, b) { return a + b; }";
    const result = inspectWrite({ filePath: 'src/math.js', content: safeContent });
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.errors.length, 0);
  });

  test('test-write-lock prevents weakening assertions in RED phase', () => {
    const oldTest = "test('req', () => { expect(a).toBe(1); expect(b).toBe(2); });";
    const weakenedTest = "test('req', () => { expect(a).toBe(1); });";
    const result = verifyTestModification({
      filePath: 'tests/unit.test.js',
      oldContent: oldTest,
      newContent: weakenedTest,
      isRedPhaseActive: true
    });
    assert.strictEqual(result.allowed, false, 'Weakened assertions must be blocked during RED phase');
  });

  test('pre-bash gate intercepts destructive git and filesystem commands', () => {
    const hardReset = inspectCommand('git reset --hard HEAD~1');
    assert.strictEqual(hardReset.allowed, false);

    const forcePush = inspectCommand('git push origin main --force');
    assert.strictEqual(forcePush.allowed, false);

    const rootDelete = inspectCommand('rm -rf /');
    assert.strictEqual(rootDelete.allowed, false);

    const safeStatus = inspectCommand('git status');
    assert.strictEqual(safeStatus.allowed, true);
  });
});

describe('Mechanical Pillar 4: Monotonic Quality Ratchets', () => {
  test('evaluates current metrics against baseline', () => {
    const metrics = collectCurrentMetrics();
    const evaluation = evaluateRatchets(metrics, { updateBaselines: false, baselinesPath: baselinesPathFor() });
    assert.strictEqual(evaluation.passed, true, 'Current sample metrics must satisfy baseline');
    assert.strictEqual(evaluation.hasRegressions, false);
  });

  test('flags quality regressions when metrics degrade', () => {
    const degradedMetrics = {
      test_coverage_pct: 60.0, // Baseline is 90%
      max_js_bundle_kb: 120.0, // Baseline is 50kB
      accessibility_violations: 5 // Must remain 0
    };
    const evaluation = evaluateRatchets(degradedMetrics, { updateBaselines: false });
    assert.strictEqual(evaluation.passed, false, 'Regressions must cause ratchet failure');
    assert.strictEqual(evaluation.hasRegressions, true);
  });
});

describe('Mechanical Pillar 5: Context Telemetry & PR Diagnostics', () => {
  test('context budget permits safe turn and token levels', () => {
    const result = checkContextBudget({ currentTurns: 8, estimatedTokens: 45000 });
    assert.strictEqual(result.healthy, true);
    assert.strictEqual(result.canContinue, true);
  });

  test('context budget engages circuit breaker at ceiling', () => {
    const result = checkContextBudget({ currentTurns: 35, estimatedTokens: 200000 });
    assert.strictEqual(result.status, 'HARD_STOP');
    assert.strictEqual(result.canContinue, false);
  });

  test('PR responder accurately diagnoses viewport failure and assigns browser-qa', () => {
    const diagnosis = diagnoseFailure('Error: element #hero-banner causes horizontal scroll at 375px viewport');
    assert.strictEqual(diagnosis.category, 'RESPONSIVE_VIEWPORT_DEFECT');
    assert.strictEqual(diagnosis.assignedAgent, '11-browser-qa');
  });
});
