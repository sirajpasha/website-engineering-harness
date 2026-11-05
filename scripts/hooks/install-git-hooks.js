import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

export function installGitHooks() {
  const gitDir = path.join(rootDir, '.git');
  if (!fs.existsSync(gitDir)) {
    console.log('[WARN] No .git directory found. Skipping git hook installation.');
    return false;
  }

  const hooksDir = path.join(gitDir, 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const preCommitHook = path.join(hooksDir, 'pre-commit');
  const prePushHook = path.join(hooksDir, 'pre-push');

  const preCommitScript = `#!/usr/bin/env sh
# Universal Website Engineering Harness - Pre-Commit Gate Hook
echo "[HARNESS] Executing Pre-Commit Mechanical Gates..."

node scripts/agent-validation/validate-contracts.js || exit 1
node scripts/quality-gates/check-gates.js || exit 1

echo "[HARNESS] All pre-commit checks passed."
exit 0
`;

  const prePushScript = `#!/usr/bin/env sh
# Universal Website Engineering Harness - Pre-Push Gate Hook
echo "[HARNESS] Executing Pre-Push Ratchet & Integrity Gates..."

node scripts/traceability/verify-traceability.js || exit 1

echo "[HARNESS] Pre-push verification passed."
exit 0
`;

  fs.writeFileSync(preCommitHook, preCommitScript, { encoding: 'utf8', mode: 0o755 });
  fs.writeFileSync(prePushHook, prePushScript, { encoding: 'utf8', mode: 0o755 });

  console.log('[PASS] Git hooks installed successfully:');
  console.log('  - .git/hooks/pre-commit');
  console.log('  - .git/hooks/pre-push');
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('install-git-hooks.js')) {
  installGitHooks();
}
