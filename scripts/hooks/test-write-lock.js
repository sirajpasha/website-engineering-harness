import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

/**
 * Counts assertions in test file content
 */
export function countAssertions(testCode) {
  const assertionPatterns = [
    /\bexpect\s*\(/g,
    /\bassert(?:\.[a-zA-Z0-9_]+)?\s*\(/g,
    /\bshould\b/g,
    /\.to(?:Be|Equal|Have|Match|StrictEqual|Throw)\b/g
  ];

  let total = 0;
  for (const pattern of assertionPatterns) {
    const matches = testCode.match(pattern);
    if (matches) total += matches.length;
  }
  return total;
}

/**
 * Validates that modifying a test file does not weaken test coverage
 */
export function verifyTestModification({ filePath, oldContent, newContent, isRedPhaseActive = false }) {
  const relPath = path.relative(rootDir, path.resolve(rootDir, filePath)).replace(/\\/g, '/');
  const violations = [];

  // Check if it's a test file
  if (!/(?:test|spec)\.[a-zA-Z0-9]+$/i.test(relPath) && !relPath.startsWith('tests/')) {
    return { allowed: true, violations: [] };
  }

  // Deletion check
  if (oldContent && (!newContent || newContent.trim().length === 0)) {
    violations.push(`Test file deletion blocked: '${relPath}' cannot be deleted without test engineering review.`);
    return { allowed: false, violations };
  }

  // Assertion weakening check during active RED phase
  if (oldContent && newContent) {
    const oldCount = countAssertions(oldContent);
    const newCount = countAssertions(newContent);

    if (isRedPhaseActive && newCount < oldCount) {
      violations.push(
        `Assertion count reduced from ${oldCount} to ${newCount} in '${relPath}'. Stripping failing assertions during RED phase is strictly forbidden.`
      );
    }
  }

  return {
    allowed: violations.length === 0,
    violations
  };
}

if (process.argv[1] && process.argv[1].endsWith('test-write-lock.js')) {
  const args = process.argv.slice(2);
  let filePath = '';
  let redPhase = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file') filePath = args[++i];
    if (args[i] === '--red-phase') redPhase = true;
  }

  if (!filePath) {
    console.error('Usage: node test-write-lock.js --file <path> [--red-phase]');
    process.exit(1);
  }

  const fullPath = path.resolve(rootDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log('[PASS] New test file creation allowed.');
    process.exit(0);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  // For CLI test, pass content as both old and new unless diff is provided
  const result = verifyTestModification({
    filePath,
    oldContent: content,
    newContent: content,
    isRedPhaseActive: redPhase
  });

  if (!result.allowed) {
    console.error('[LOCK ENGAGED] Test modification blocked:');
    result.violations.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  } else {
    console.log('[PASS] Test write lock check satisfied.');
    process.exit(0);
  }
}
