# WORKFLOW: TEST-DRIVEN DEVELOPMENT (TDD)

## 1. Overview
The TDD workflow guarantees that every critical frontend feature and business rule is anchored by independently verifiable automated tests.

## 2. Red-Green-Refactor Protocol

```mermaid
stateDiagram-v2
    [*] --> RED: Write Failing Test
    RED --> RED_CHECK: Run Test Runner
    RED_CHECK --> GREEN: Confirmed Intended Failure
    RED_CHECK --> RED: Syntax/Import Error (Fix Test)
    GREEN --> GREEN_CHECK: Write Minimal Code
    GREEN_CHECK --> REFACTOR: Test Passes Cleanly
    GREEN_CHECK --> GREEN: Test Still Fails (Fix Code)
    REFACTOR --> VERIFY_ALL: Clean Code & Tokens
    VERIFY_ALL --> [*]: All Tests Pass
```

## 3. Mandatory Rules
1. Never commit production code without a pre-existing failing test.
2. Confirm the test fails for the specific behavior expected, not because of missing dependencies.
3. Every test file must reference its matching `REQ-XXX` identifier.
