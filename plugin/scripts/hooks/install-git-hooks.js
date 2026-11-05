import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_ROOT, projectRoot, isHarnessRepo } from '../lib/paths.js';

const toPosix = (p) => p.split(path.sep).join('/');

/**
 * Install git hooks into the current project.
 *
 * - In the harness repo itself: contracts + gates pre-commit, integrity pre-push (strict, as before).
 * - In a website project: pre-commit runs the quality ratchets only when baselines exist (a
 *   work-in-progress site must stay committable); pre-push is advisory unless `strict` is set,
 *   in which case it runs the full G1-G13 gate audit.
 */
export function installGitHooks({ strict = false, dir = projectRoot() } = {}) {
  const gitDir = path.join(dir, '.git');
  if (!fs.existsSync(gitDir)) {
    console.log('[WARN] No .git directory found. Skipping git hook installation.');
    return false;
  }

  const hooksDir = path.join(gitDir, 'hooks');
  fs.mkdirSync(hooksDir, { recursive: true });

  const H = toPosix(HARNESS_ROOT);
  const harnessRepo = isHarnessRepo(dir);

  let preCommit;
  let prePush;

  if (harnessRepo) {
    preCommit = `#!/usr/bin/env sh
# Website Engineering Harness - pre-commit (harness repo)
echo "[HARNESS] Executing pre-commit gates..."
node scripts/agent-validation/validate-contracts.js || exit 1
node scripts/quality-gates/check-gates.js || exit 1
exit 0
`;
    prePush = `#!/usr/bin/env sh
# Website Engineering Harness - pre-push (harness repo)
echo "[HARNESS] Executing pre-push integrity gates..."
node scripts/traceability/verify-traceability.js || exit 1
exit 0
`;
  } else {
    preCommit = `#!/usr/bin/env sh
# Website Engineering Harness - pre-commit (website project)
# Blocks commits that regress a recorded quality ratchet. Skipped until baselines exist.
if [ -f ".harness/baselines.json" ]; then
  echo "[HARNESS] Checking quality ratchets..."
  node "${H}/scripts/ratchets/check-ratchet.js" --target "$(pwd)" || exit 1
fi
exit 0
`;
    prePush = strict
      ? `#!/usr/bin/env sh
# Website Engineering Harness - pre-push (strict): full G1-G13 gate audit
node "${H}/scripts/quality-gates/check-gates.js" --target "$(pwd)" || exit 1
exit 0
`
      : `#!/usr/bin/env sh
# Website Engineering Harness - pre-push (advisory): reports gate status, never blocks.
node "${H}/scripts/quality-gates/check-gates.js" --target "$(pwd)" || echo "[HARNESS] Gates not yet satisfied (advisory; re-run install-hooks --strict to enforce)."
exit 0
`;
  }

  fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommit, { encoding: 'utf8', mode: 0o755 });
  fs.writeFileSync(path.join(hooksDir, 'pre-push'), prePush, { encoding: 'utf8', mode: 0o755 });

  console.log('[PASS] Git hooks installed:');
  console.log('  - .git/hooks/pre-commit');
  console.log(`  - .git/hooks/pre-push${harnessRepo || strict ? ' (enforcing)' : ' (advisory)'}`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('install-git-hooks.js')) {
  installGitHooks({ strict: process.argv.includes('--strict') });
}
