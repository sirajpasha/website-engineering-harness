import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function verifyTddCycle({ testFile, testCommand } = {}) {
  const receiptsDir = path.join(rootDir, '.harness', 'receipts');
  const redReceiptPath = path.join(receiptsDir, 'red-phase.receipt.json');

  console.log('Verifying TDD Lifecycle Proofs (Gate G7)...');

  // Check 1: RED phase receipt must exist
  if (!fs.existsSync(redReceiptPath)) {
    return {
      passed: false,
      reason: 'No RED phase receipt found at .harness/receipts/red-phase.receipt.json. TDD mandates a recorded RED test failure before GREEN implementation.'
    };
  }

  const redReceipt = JSON.parse(fs.readFileSync(redReceiptPath, 'utf8'));
  const targetFile = testFile || redReceipt.test_file;
  const fullTestPath = path.resolve(rootDir, targetFile);

  if (!fs.existsSync(fullTestPath)) {
    return {
      passed: false,
      reason: `Recorded test file no longer exists: ${targetFile}`
    };
  }

  // Check 2: Execute test runner to verify it is now GREEN
  const cmd = testCommand || redReceipt.test_command || `node --test ${targetFile}`;
  console.log(`[TDD GREEN] Running test command: ${cmd}`);

  try {
    const stdout = execSync(cmd, { cwd: rootDir, encoding: 'utf8', stdio: 'pipe' });
    console.log('[PASS] Test suite passed successfully (GREEN phase confirmed).');

    // Generate GREEN receipt
    const testContent = fs.readFileSync(fullTestPath, 'utf8');
    const greenReceipt = {
      phase: 'GREEN',
      timestamp: new Date().toISOString(),
      test_file: targetFile,
      test_file_sha256: sha256(testContent),
      red_receipt_ref: redReceipt.failure_sha256,
      status: 'VERIFIED_GREEN'
    };

    fs.writeFileSync(
      path.join(receiptsDir, 'green-phase.receipt.json'),
      JSON.stringify(greenReceipt, null, 2),
      'utf8'
    );

    return {
      passed: true,
      redReceipt,
      greenReceipt
    };
  } catch (err) {
    return {
      passed: false,
      reason: `GREEN phase verification failed: test still failing.\n${err.stdout || ''}\n${err.stderr || ''}`
    };
  }
}

if (process.argv[1] && process.argv[1].endsWith('verify-tdd.js')) {
  const args = process.argv.slice(2);
  let testFile = '';
  let testCommand = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--test-file') testFile = args[++i];
    if (args[i] === '--command') testCommand = args[++i];
  }

  const result = verifyTddCycle({ testFile, testCommand });
  if (result.passed) {
    console.log('[PASS] TDD Red-Green verification cycle fully certified.');
    process.exit(0);
  } else {
    console.error(`[FAIL] ${result.reason}`);
    process.exit(1);
  }
}
