/**
 * Append-only model usage log (.harness/telemetry/model-usage.jsonl in the user's project).
 * Records which model ran which task and any fallback substitution. Token counts are
 * written only when supplied by the caller (never estimated here). Whitelisted fields
 * only, so credentials passed by mistake are not persisted.
 */
import fs from 'node:fs';
import path from 'node:path';
import { projectRoot } from './paths.js';

const FIELDS = ['task', 'agent', 'requested', 'model', 'substituted', 'reason', 'tokens', 'escalated'];
const file = (projectDir) => path.join(projectDir, '.harness', 'telemetry', 'model-usage.jsonl');

export function logModelUsage(entry, { projectDir = projectRoot() } = {}) {
  const row = { ts: new Date().toISOString() };
  for (const f of FIELDS) if (entry[f] !== undefined) row[f] = entry[f];
  fs.mkdirSync(path.dirname(file(projectDir)), { recursive: true });
  fs.appendFileSync(file(projectDir), JSON.stringify(row) + '\n', 'utf8');
  return row;
}

export function readModelUsage({ projectDir = projectRoot() } = {}) {
  const f = file(projectDir);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
}
