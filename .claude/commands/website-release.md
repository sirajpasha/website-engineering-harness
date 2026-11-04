# COMMAND: /website-release

## Description
Activates AGENT 16 (Production Readiness & Release Reviewer) to verify Quality Gate G13, audit release prerequisites, compile release notes, and certify production readiness.

## Invocations
- Claude Code: `/website-release`
- Terminal / Node: `node scripts/harness-cli.js release`

## Workflow Steps
1. Consolidate evidence from all upstream gates G1 through G12.
2. Confirm zero unresolved P0/P1 defects and zero CRITICAL/HIGH security vulnerabilities.
3. Validate operational deployment configuration.
4. Compile `RELEASE_CHECKLIST.md` and `RELEASE_NOTES.md`.
5. Issue authoritative verdict: `APPROVED FOR PRODUCTION`, `APPROVED WITH NON-BLOCKING ISSUES`, or `REJECTED`.
