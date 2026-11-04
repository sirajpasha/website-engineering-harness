# COMMAND: /website-tdd

## Description
Activates AGENT 10 (TDD & Test Engineering Specialist) to execute strict Red-Green-Refactor cycles on target vertical slices, ensuring verifiable test coverage.

## Invocations
- Claude Code: `/website-tdd`
- Terminal / Node: `node scripts/harness-cli.js tdd`

## Workflow Steps
1. Select target requirement (`REQ-XXX`).
2. Write automated test in `tests/` verifying expected behavior.
3. Execute test: Confirm failure (RED).
4. Implement minimum production code.
5. Execute test: Confirm clean pass (GREEN).
6. Refactor code and re-run all test suites.
7. Record test results in `TEST_TRACEABILITY_MATRIX.md`.
8. Enforce Quality Gate G7 (TDD Verification).
