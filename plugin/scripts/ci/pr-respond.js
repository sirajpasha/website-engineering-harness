import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

export function diagnoseFailure(ciLogText) {
  const diagnosis = {
    category: 'UNKNOWN',
    assignedAgent: '01-orchestrator',
    suggestedFix: '',
    severity: 'P2'
  };

  if (/horizontal\s*scroll|overflow|viewport|playwright/i.test(ciLogText)) {
    diagnosis.category = 'RESPONSIVE_VIEWPORT_DEFECT';
    diagnosis.assignedAgent = '11-browser-qa';
    diagnosis.suggestedFix = 'Inspect elements exceeding viewport width at 375px/390px. Add max-width: 100% and overflow-x: hidden on container boundaries.';
    diagnosis.severity = 'P1';
  } else if (/wcag|contrast|aria-|accessibility/i.test(ciLogText)) {
    diagnosis.category = 'ACCESSIBILITY_DEFECT';
    diagnosis.assignedAgent = '14-seo-accessibility';
    diagnosis.suggestedFix = 'Ensure minimum 4.5:1 text contrast and add missing aria-label or accessible names to interactive controls.';
    diagnosis.severity = 'P1';
  } else if (/assertionerror|expect\(|failing\s*test/i.test(ciLogText)) {
    diagnosis.category = 'TDD_ASSERTION_DEFECT';
    diagnosis.assignedAgent = '09-tdd-test-engineer';
    diagnosis.suggestedFix = 'Follow strict RED-GREEN-REFACTOR cycle. Do not weaken assertions in test suite; fix underlying implementation in src/.';
    diagnosis.severity = 'P0';
  } else if (/bundle\s*size|ratchet|regression|lcp/i.test(ciLogText)) {
    diagnosis.category = 'RATCHET_REGRESSION';
    diagnosis.assignedAgent = '13-web-performance-auditor';
    diagnosis.suggestedFix = 'Analyze bundle dependencies with tree-shaking and dynamic imports. Check .harness/baselines.json tolerances.';
    diagnosis.severity = 'P1';
  }

  return diagnosis;
}

export function handlePrResponse({ logFile, rawLog } = {}) {
  let logContent = rawLog || '';
  if (logFile) {
    const fullLogPath = path.resolve(rootDir, logFile);
    if (fs.existsSync(fullLogPath)) {
      logContent = fs.readFileSync(fullLogPath, 'utf8');
    }
  }

  if (!logContent) {
    logContent = 'AssertionError: Expected 6 viewports to pass with 0 horizontal scroll, but found 375px overflow.';
  }

  console.log('[PR RESPONDER] Diagnosing CI / Review feedback...');
  const diagnosis = diagnoseFailure(logContent);

  console.log(`  Issue Category:  ${diagnosis.category}`);
  console.log(`  Assigned Agent:  ${diagnosis.assignedAgent}`);
  console.log(`  Severity:        ${diagnosis.severity}`);
  console.log(`  Remediation:     ${diagnosis.suggestedFix}`);

  // Log to defect register if exists
  const defectRegisterPath = path.join(rootDir, 'examples', 'sample-website', 'DEFECT_REGISTER.md');
  if (fs.existsSync(defectRegisterPath)) {
    const defectEntry = `\n| AUTO-${Date.now().toString().slice(-4)} | ${diagnosis.severity} | ${diagnosis.category} | ${diagnosis.suggestedFix} | ${diagnosis.assignedAgent} | Open |\n`;
    fs.appendFileSync(defectRegisterPath, defectEntry, 'utf8');
    console.log(`[PASS] Defect recorded in DEFECT_REGISTER.md`);
  }

  return {
    status: 'DIAGNOSED',
    ...diagnosis
  };
}

if (process.argv[1] && process.argv[1].endsWith('pr-respond.js')) {
  const args = process.argv.slice(2);
  let logFile = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--log') logFile = args[++i];
  }

  handlePrResponse({ logFile });
}
