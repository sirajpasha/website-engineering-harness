import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { projectRoot } from '../lib/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = projectRoot(); // the website project (receipts, tests, telemetry live there)

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function recordRedPhase({ testFile, testCommand }) {
  const fullTestPath = path.resolve(rootDir, testFile);
  if (!fs.existsSync(fullTestPath)) {
    throw new Error(`Test file not found: ${testFile}`);
  }

  const testContent = fs.readFileSync(fullTestPath, 'utf8');
  const testFileSha = sha256(testContent);

  const cmd = testCommand || `node --test ${testFile}`;
  console.log(`[TDD RED] Executing test runner expecting failure: ${cmd}`);

  let failed = false;
  let failureOutput = '';

  try {
    const stdout = execSync(cmd, { cwd: rootDir, encoding: 'utf8', stdio: 'pipe' });
    // If command succeeds, it's NOT a red phase!
    throw new Error(`RED phase rejected: Test passed without implementation! Tests must fail first.`);
  } catch (err) {
    if (err.message && err.message.startsWith('RED phase rejected')) {
      throw err;
    }
    failed = true;
    failureOutput = (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + (err.message || '');
  }

  if (!failed) {
    throw new Error(`RED phase failed: test did not produce expected assertion failure.`);
  }

  const failureSha = sha256(failureOutput);
  const receiptsDir = path.join(rootDir, '.harness', 'receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const receipt = {
    phase: 'RED',
    timestamp: new Date().toISOString(),
    test_file: path.relative(rootDir, fullTestPath).replace(/\\/g, '/'),
    test_file_sha256: testFileSha,
    test_command: cmd,
    failure_sha256: failureSha,
    failure_preview: failureOutput.slice(0, 500)
  };

  const receiptPath = path.join(receiptsDir, 'red-phase.receipt.json');
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');

  console.log(`[PASS] RED phase verified and cryptographically recorded.`);
  console.log(`  Test File SHA: ${testFileSha.slice(0, 16)}...`);
  console.log(`  Failure SHA:   ${failureSha.slice(0, 16)}...`);
  console.log(`  Receipt:       .harness/receipts/red-phase.receipt.json`);

  return receipt;
}

if (process.argv[1] && process.argv[1].endsWith('red-phase-recorder.js')) {
  const args = process.argv.slice(2);
  let testFile = '';
  let testCommand = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--test-file') testFile = args[++i];
    if (args[i] === '--command') testCommand = args[++i];
  }

  if (!testFile) {
    // Default to the sample website test if not specified
    testFile = 'examples/sample-website/tests/sample-website.test.js';
  }

  try {
    recordRedPhase({ testFile, testCommand });
    process.exit(0);
  } catch (err) {
    console.error(`[FAIL] ${err.message}`);
    process.exit(1);
  }
}
