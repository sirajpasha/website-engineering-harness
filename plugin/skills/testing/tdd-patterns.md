# TEST-DRIVEN DEVELOPMENT PATTERNS (skills/testing/)

## 1. Overview
Embodying the disciplines of Matt Pocock (`tdd`, `diagnosing-bugs`) and Addy Osmani (`test-driven-development`), this skill establishes repeatable testing patterns for frontend systems.

## 2. Red-Green-Refactor Step Checklist
1. **Identify Requirement:** Pick target `REQ-XXX` from `REQUIREMENTS.md`.
2. **Define Test Oracle:** Determine observable input and expected output/DOM event.
3. **Write Failing Test (RED):**
   - Save test in `tests/unit/` or `tests/integration/`.
   - Run runner: `npm test` or `node --test`.
   - **Mandatory Check:** Verify test fails with the expected assertion error (NOT a syntax error or missing module error).
4. **Implement Minimum Code (GREEN):**
   - Write the simplest code that allows the test to pass.
   - Run runner: Verify test passes cleanly.
5. **Refactor Safely (REFACTOR):**
   - Clean up code, enforce design tokens, extract duplication.
   - Run runner: Verify all tests remain green.

## 3. Bug Diagnosis Procedure
When a regression or defect is identified in `DEFECT_REGISTER.md`:
1. Do not touch production code immediately.
2. Write a minimal reproduction test that isolates the bug.
3. Confirm the reproduction test fails (RED).
4. Apply the targeted fix.
5. Confirm the reproduction test passes (GREEN).
6. Commit test alongside the fix to prevent future regression.
