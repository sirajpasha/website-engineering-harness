# WORKFLOW: EXISTING WEBSITE REDESIGN

## 1. Overview
The `REDESIGN` workflow applies when overhauling an existing website to eliminate visual debt, modernize UX, fix accessibility, improve Core Web Vitals, and introduce a modern design system.

## 2. Phased Execution Flow
1. **Existing Environment & Codebase Audit:** Inspect active tech stack, components, and technical debt.
2. **UX & Heuristic Critique:** Run Impeccable critique on existing views; catalog flaws in `DEFECT_REGISTER.md`.
3. **Requirement Grilling & Re-alignment:** Identify what to preserve, what to refactor, and what to eliminate.
4. **New Art Direction (Taste Skill):** Define fresh visual direction and design tokens.
5. **Screen Prototyping (Google Stitch):** Generate updated screens and component variants.
6. **TDD Incremental Migration:** Re-implement components slice-by-slice under test harnesses.
7. **Cross-Viewport Regression QA:** Run Playwright on both legacy and new routes across 6 viewports.
8. **Security, Performance & Accessibility Audits:** Verify zero regressions.
9. **Release Gate G13 Sign-off.**
