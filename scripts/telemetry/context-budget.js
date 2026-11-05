import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot } from '../lib/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = projectRoot(); // the website project (receipts, tests, telemetry live there)

export const BUDGET_DEFAULTS = {
  softTurnLimit: 20,
  hardTurnLimit: 30,
  softTokenLimit: 140000,
  hardTokenLimit: 190000
};

export function checkContextBudget({ currentTurns = 0, estimatedTokens = 0, agentId = 'orchestrator' } = {}) {
  const telemetryDir = path.join(rootDir, '.harness', 'telemetry');
  if (!fs.existsSync(telemetryDir)) {
    fs.mkdirSync(telemetryDir, { recursive: true });
  }

  const warnings = [];
  let status = 'HEALTHY';

  if (estimatedTokens >= BUDGET_DEFAULTS.hardTokenLimit || currentTurns >= BUDGET_DEFAULTS.hardTurnLimit) {
    status = 'HARD_STOP';
    warnings.push(
      `[CIRCUIT BREAKER] Turn count (${currentTurns}) or token count (${estimatedTokens.toLocaleString()}) reached hard ceiling. Immediate task handoff or session compaction required.`
    );
  } else if (estimatedTokens >= BUDGET_DEFAULTS.softTokenLimit || currentTurns >= BUDGET_DEFAULTS.softTurnLimit) {
    status = 'SOFT_WARNING';
    warnings.push(
      `[BUDGET WARNING] Turn count (${currentTurns}) or token count (${estimatedTokens.toLocaleString()}) exceeded soft limit (140k tokens / 20 turns). Delegate sub-tasks to avoid context degradation.`
    );
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    agentId,
    currentTurns,
    estimatedTokens,
    status,
    warnings
  };

  const logFile = path.join(telemetryDir, 'context-usage.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');

  return {
    status,
    healthy: status === 'HEALTHY',
    canContinue: status !== 'HARD_STOP',
    warnings
  };
}

if (process.argv[1] && process.argv[1].endsWith('context-budget.js')) {
  const args = process.argv.slice(2);
  let turns = 0;
  let tokens = 0;
  let agent = 'orchestrator';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--turns') turns = parseInt(args[++i], 10) || 0;
    if (args[i] === '--tokens') tokens = parseInt(args[++i], 10) || 0;
    if (args[i] === '--agent') agent = args[++i];
  }

  const result = checkContextBudget({ currentTurns: turns, estimatedTokens: tokens, agentId: agent });
  console.log(`Context Budget Status: [${result.status}]`);
  if (result.warnings.length > 0) {
    result.warnings.forEach(w => console.warn(w));
  } else {
    console.log('[PASS] Context and token budget within safe operational limits.');
  }
  process.exit(result.canContinue ? 0 : 1);
}
