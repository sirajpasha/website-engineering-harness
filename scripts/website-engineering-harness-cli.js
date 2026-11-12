#!/usr/bin/env node
/**
 * Universal Website Engineering Harness Master CLI Runner
 * Compatible with Claude Code CLI, Gemini CLI / Antigravity, OpenAI Codex / Copilot, Cursor, Windsurf, or Terminal.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEnvironmentAudit } from './environment-audit/audit-environment.js';
import { validateAgents } from './agent-validation/validate-agents.js';
import { validateContracts } from './agent-validation/validate-contracts.js';
import { validateSkills } from './skill-validation/validate-skills.js';
import { validateMCP } from './mcp-validation/validate-mcp.js';
import { validateSubagents } from './agent-validation/sync-claude-agents.js';
import { checkGates } from './quality-gates/check-gates.js';
import { verifyTraceability } from './traceability/verify-traceability.js';
import { validateBrowser } from './browser-validation/validate-browser.js';
import { installGitHooks } from './hooks/install-git-hooks.js';
import { recordRedPhase } from './tdd/red-phase-recorder.js';
import { verifyTddCycle } from './tdd/verify-tdd.js';
import { evaluateRatchets, collectCurrentMetrics, seedBaselines, baselinesPathFor } from './ratchets/check-ratchet.js';
import { checkContextBudget } from './telemetry/context-budget.js';
import { handlePrResponse } from './ci/pr-respond.js';
import { classifyRequest } from './lib/classify-request.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');
const VERSION = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version;

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase().replace(/^--?/, '') : 'help';

function showHelp() {
  console.log(`
===================================================================
  UNIVERSAL WEBSITE ENGINEERING, DESIGN & QUALITY HARNESS (v${VERSION})
===================================================================

Usage:
  website-engineering-harness <command> [options]
  node scripts/website-engineering-harness-cli.js <command> [options]
  npm run website-engineering-harness <command>

Core Inspection Commands:
  audit                Run full environment and runtime capability audit
  validate             Validate all 16 agents, machine contracts, skill registry, and MCP bindings
  validate:agents      Verify the 16 specialized agent markdown definitions
  validate:contracts   Verify the 16 machine-enforceable agent boundary contracts (*.contract.json)
  validate:skills      Verify skill registry, governance policy, and wrappers
  validate:mcp         Verify Model Context Protocol configuration (mcp.json)
  validate:trace       Verify Requirement-to-Test Traceability Matrix
  gates, gate          Run Quality Gate Audit across G1 through G13 with mechanical enforcement
  test:browser [file|url] [--project dir] [--out dir]  Run browser validation across the 6 mandatory viewports
                       (a URL run binds its evidence to the project sources, so the gate can detect stale evidence)

Client deliverables:
  classify <create|redesign|improve> <text>  Classify a request into a lifecycle mode + project sub-type (JSON)
  walkthrough [url|file] Record desktop + phone videos of the real build and an unsigned CLIENT_APPROVAL.md
                       [--out dir] [--devices desktop,phone] [--pages /,/about] [--label "Name v1"] [--no-captions]

Use it from your AI tool:
  install --tool <name>  Add the harness to this project for cursor|claude|gemini|copilot|codex|windsurf|generic|all
  mcp                  Run the MCP server on stdio (what the AI tool launches)

Mechanical Safeguards & Ratchets:
  install-hooks        Install Git pre-commit and pre-push deterministic interceptor hooks
  ratchet [--update] [--target dir]  Measure metrics and evaluate monotonic ratchets (<target>/.harness/baselines.json)
  tdd:red <test-file>  Record cryptographic proof of failing RED test in .harness/receipts/
  tdd:verify           Verify RED receipt exists and test suite is certified GREEN
  budget               Inspect context turns and token budget ceiling
  pr-respond [--log f] Run autonomous self-healing CI diagnostic and remediation loop

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
      const cRes = validateContracts();
      const sRes = validateSkills();
      const mRes = validateMCP();
      const tRes = verifyTraceability();
      const subRes = validateSubagents({ log: console.log });
      const gRes = checkGates();

      console.log('\n====================================================');
      console.log('  OVERALL HARNESS SELF-VALIDATION SUMMARY');
      console.log('====================================================');
      console.log(`- Agents (MD):     ${aRes.passed}/${aRes.total} Passed`);
      console.log(`- Contracts (JSON):${cRes.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`- Subagents:       ${subRes.passed ? 'PASSED' : 'FAILED'} (.claude/agents frontmatter + drift)`);
      console.log(`- Skills:          ${sRes.passed}/${sRes.total} Passed`);
      console.log(`- MCP Config:      ${mRes.valid ? 'VALID' : 'INVALID'}`);
      console.log(`- Traceability:    ${tRes.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`- Quality Gates:   ${gRes.passed}/${gRes.total} Gates Verified`);
      console.log('====================================================\n');
      if (!(aRes.passed === aRes.total && cRes.passed && subRes.passed && sRes.passed === sRes.total && mRes.valid && tRes.passed && gRes.allPassed)) {
        console.error('[FAIL] Harness self-validation found problems (see above).');
        process.exitCode = 1;
      }
      break;

    case 'validate:agents':
      validateAgents();
      break;

    case 'validate:contracts':
    case 'contracts':
      validateContracts();
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

    case 'install-hooks':
    case 'hooks':
      installGitHooks({ strict: args.includes('--strict') });
      break;

    case 'classify': {
      const [sub, ...rest] = args.slice(1);
      try {
        const projectDir = process.env.HARNESS_PROJECT_DIR || process.env.CLAUDE_PROJECT_DIR || process.cwd();
        const hasProject = fs.existsSync(path.join(projectDir, 'package.json')) || fs.existsSync(path.join(projectDir, 'index.html'));
        const r = classifyRequest({ command: sub, text: rest.join(' '), hasProject });
        console.log(JSON.stringify(r, null, 2));
        if (r.blocked) process.exitCode = 1;
      } catch (e) { console.error(e.message); process.exitCode = 2; }
      break;
    }

    case 'walkthrough': {
      const { recordWalkthrough, parseWalkthroughArgs } = await import('./walkthrough/walkthrough.js');
      const { target, options } = parseWalkthroughArgs(args.slice(1));
      const r = await recordWalkthrough(target, options);
      if (!r.passed) process.exitCode = 1;
      break;
    }

    case 'install': {
      const { installTools, printResult, parseInstallArgs, TOOLS } = await import('./install/install.js');
      const opts = parseInstallArgs(args.slice(1));
      if (!opts.tools.length) {
        console.error('Usage: website-engineering-harness install --tool <' + Object.keys(TOOLS).join('|') + '|all> [--dir <project>] [--runner auto|npx|node] [--force]');
        process.exitCode = 1;
        break;
      }
      try { printResult(installTools(opts)); } catch (e) { console.error(e.message); process.exitCode = 1; }
      break;
    }

    case 'mcp':
      // Stdio MCP server: stdout is the protocol channel, so print nothing else.
      await import('./mcp-server/server.js');
      await new Promise(() => {});
      break;

    case 'ratchet':
    case 'check-ratchet': {
      const update = args.includes('--update') || args.includes('-u');
      const ti = args.indexOf('--target');
      const target = ti >= 0 ? args[ti + 1] : undefined;
      const metrics = collectCurrentMetrics(target);
      const bp = baselinesPathFor(target);
      if (update && seedBaselines(metrics, bp)) console.log('[RATCHET] Seeded new baselines from measured values.');
      const outcome = evaluateRatchets(metrics, { updateBaselines: update, baselinesPath: bp });
      if (!outcome.passed) {
        process.exit(1);
      }
      break;
    }

    case 'tdd:red':
    case 'tdd-red': {
      const testFile = args[1] || 'examples/sample-website/tests/sample-website.test.js';
      const testCommand = args[2] || '';
      recordRedPhase({ testFile, testCommand });
      break;
    }

    case 'tdd:verify':
    case 'tdd-verify': {
      const result = verifyTddCycle();
      if (!result.passed) {
        process.exit(1);
      }
      break;
    }

    case 'budget':
    case 'telemetry': {
      const turns = parseInt(args[1], 10) || 5;
      const tokens = parseInt(args[2], 10) || 25000;
      const budgetRes = checkContextBudget({ currentTurns: turns, estimatedTokens: tokens });
      console.log(`Context Budget Status: [${budgetRes.status}]`);
      console.log(`  Current Turns:     ${turns}`);
      console.log(`  Estimated Tokens:  ${tokens.toLocaleString()}`);
      if (budgetRes.warnings.length > 0) {
        budgetRes.warnings.forEach(w => console.warn(`  ${w}`));
      } else {
        console.log('  [PASS] Context usage well within safe operational headroom.');
      }
      break;
    }

    case 'pr-respond': {
      const logFile = args[1] || '';
      handlePrResponse({ logFile });
      break;
    }

    case 'gate':
    case 'gates': {
      const ti = args.indexOf('--target');
      const r = checkGates(ti >= 0 ? args[ti + 1] : undefined);
      if (!r.allPassed) process.exitCode = 1;
      break;
    }

    case 'test:browser':
    case 'test':
      {
        const rest = args.slice(1);
        const take = (flag) => { const i = rest.indexOf(flag); return i >= 0 ? rest.splice(i, 2)[1] : undefined; };
        const outDir = take('--out');
        const projectDir = take('--project');
        const r = await validateBrowser(rest[0], { outDir, projectDir });
        if (!r.passed) process.exitCode = 1;
      }
      break;

    case 'init':
      console.log('>>> Initializing Universal Website Harness Scaffolding <<<');
      runEnvironmentAudit();
      installGitHooks();
      console.log('\n[✔] Project environment and deterministic hooks ready. Proceed to requirement grilling via "/website-grill".');
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
