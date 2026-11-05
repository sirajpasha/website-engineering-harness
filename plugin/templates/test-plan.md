# TEMPLATE: TEST PLAN & STRATEGY (TEST_PLAN.md)

# Test Strategy: [Project Name]
**Lead QA:** AGENT 10 (TDD Specialist) & AGENT 11 (Playwright Browser Engineer)  
**Quality Gate G7 / G9 Status:** [PENDING | PASSED]  

---

## 1. Testing Pyramid Distribution
- **Unit Tests:** Business logic, state stores, pure utility functions.
- **Component Tests:** Render tests, keyboard events, accessible states.
- **E2E Browser Tests:** Real Playwright browser runs across the 6 standard viewports.

## 2. Browser Viewport Matrix
- `360 × 800` (Mobile Compact)
- `390 × 844` (Mobile Modern)
- `768 × 1024` (Tablet Portrait)
- `1024 × 768` (Tablet Landscape)
- `1440 × 900` (Desktop Standard)
- `1920 × 1080` (Desktop FHD)

## 3. Pass/Fail Thresholds
- 100% unit/integration tests passing.
- Zero horizontal overflow on non-scrolling views.
- Zero unhandled console errors.
