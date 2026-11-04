# WORKFLOW: ENHANCEMENT & FEATURE ITERATION

## 1. Overview
The `ENHANCE` workflow is designed for incremental feature additions, minor redesigns, or targeted bug fixes within an established website project.

## 2. Fast-Track Execution Flow
1. **Scope Grilling:** Interrogate the specific feature request; assign a new requirement ID (`REQ-XXX`).
2. **Acceptance Criteria Definition:** Write specific Gherkin test scenarios in `ACCEPTANCE_CRITERIA.md`.
3. **Architecture Impact Review:** Identify affected components and state boundaries.
4. **TDD Implementation:**
   - Write failing automated test (RED).
   - Write minimum feature code (GREEN).
   - Refactor for design token adherence (REFACTOR).
5. **Targeted Browser Check:** Verify feature across the 6 standard viewports in Playwright.
6. **Targeted Security & Performance Check:** Verify no newly introduced injection risks or bundle bloat.
7. **Code Review & Release Gate Sign-off.**
