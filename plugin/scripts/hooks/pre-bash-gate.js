/**
 * Pre-Bash Safety Guard
 * Inspects shell commands before execution to prevent catastrophic or destructive operations.
 */

const BLOCKED_PATTERNS = [
  {
    pattern: /git\s+reset\s+--hard/i,
    reason: 'Hard git resets discard uncommitted work and destroy traceability receipts.'
  },
  {
    pattern: /git\s+push\s+(?:.*--force|-f\b)/i,
    reason: 'Force-pushing rewrites remote history and violates release governance.'
  },
  {
    // rm with recursive/force flags (any order, split or combined, or --no-preserve-root) whose target is the
    // filesystem root, the home directory, a bare wildcard, or the current/parent directory. Deleting a specific
    // folder (rm -rf /tmp/build, rm -rf ./dist) is NOT matched.
    pattern: /\brm\s+(?:(?:-[a-z]+|--no-preserve-root)\s+)+(?:--\s+)?(?:\/\*?|\*|~\/?\*?|\$HOME\/?\*?|\.{1,2}|\.\/\*)(?=\s|$|[;&|])/i,
    reason: 'Recursive root, home, wildcard or working-directory deletion is prohibited.'
  },
  {
    pattern: /(?:rmdir\s+\/s\s+\/q\s+[\\\/.]|del\s+\/f\s+\/s\s+\/q\s+\*)/i,
    reason: 'Recursive root or wildcard deletion is prohibited.'
  },
  {
    pattern: /git\s+commit\s+.*--no-verify/i,
    reason: 'Bypassing git hooks via --no-verify violates Quality Gate policy.'
  },
  {
    pattern: /chmod\s+777/i,
    reason: 'Indiscriminate permission broadening violates Security Standard.'
  }
];

export function inspectCommand(commandLine) {
  if (!commandLine || typeof commandLine !== 'string') {
    return { allowed: true, blockedReason: null };
  }

  for (const item of BLOCKED_PATTERNS) {
    if (item.pattern.test(commandLine)) {
      return {
        allowed: false,
        blockedReason: item.reason,
        matchedPattern: item.pattern.toString()
      };
    }
  }

  return { allowed: true, blockedReason: null };
}

if (process.argv[1] && process.argv[1].endsWith('pre-bash-gate.js')) {
  const cmd = process.argv.slice(2).join(' ');
  if (!cmd) {
    console.error('Usage: node pre-bash-gate.js "<command>"');
    process.exit(1);
  }

  const result = inspectCommand(cmd);
  if (!result.allowed) {
    console.error(`[EXECUTION BLOCKED] Command rejected by safety guard:`);
    console.error(`  Reason: ${result.blockedReason}`);
    process.exit(1);
  } else {
    console.log('[PASS] Command verified safe.');
    process.exit(0);
  }
}
