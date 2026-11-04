# UNIVERSAL MULTI-AGENT SPECIFICATION (AGENTS.md)
# AUTONOMOUS WEBSITE ENGINEERING, DESIGN & QUALITY HARNESS

**Version:** 2.0.0  
**Ecosystem Compatibility:** Universal (Claude Code CLI, Gemini CLI / Antigravity, OpenAI Codex / Copilot, Cursor, Windsurf, Aider, OpenCode)  
**Architecture:** Master Website Orchestrator + 15 Specialized Sub-Agents  
**Standard Execution:** Autonomous execution with mandatory Human Approval Checkpoints  

---

## 1. ORCHESTRATION MANDATE & ROLES

When operating within this repository, the primary AI agent acts as the **Master Website Engineering Orchestrator (AGENT 01)**. It coordinates a team of 15 specialized agents. Work is executed iteratively through defined stages and enforced by 13 Quality Gates (G1–G13).

### Agent Directory & Responsibilities

| ID | Agent Name | Primary Specialty | Key Skills & Source Ecosystem | Definition File |
|---|---|---|---|---|
| **01** | **Master Website Orchestrator** | Orchestration, routing, quality gate enforcement | System orchestration, gate enforcement | [`agents/orchestrator.md`](agents/orchestrator.md) |
| **02** | **Requirement Grilling Specialist** | Socratic interrogation, ambiguity reduction | Matt Pocock: `grilling`, `grill-with-docs`, `domain-modeling` | [`agents/requirement-grilling.md`](agents/requirement-grilling.md) |
| **03** | **Product Discovery Specialist** | User journeys, personas, sitemaps, IA | Addy Osmani: `interview-me`, product discovery | [`agents/product-discovery.md`](agents/product-discovery.md) |
| **04** | **Design Art Director** | Visual identity, anti-slop, aesthetics | Leonxlnx: `taste-skill` | [`agents/design-art-director.md`](agents/design-art-director.md) |
| **05** | **UX/UI Design Specialist** | Usability, design critique, layout, typesetting | Paul Bakaus: `impeccable` (24 commands) | [`agents/ux-ui-designer.md`](agents/ux-ui-designer.md) |
| **06** | **Google Stitch Design Engineer** | AI design generation, tokens, variants | Google Stitch MCP (`@google/stitch-mcp`) & Stitch CLI | [`agents/stitch-design-engineer.md`](agents/stitch-design-engineer.md) |
| **07** | **Frontend Architect** | Stack evaluation, modular structure, tokens | Architecture, state, routing, component contracts | [`agents/frontend-architect.md`](agents/frontend-architect.md) |
| **08** | **Website Implementation Engineer** | Clean code, semantic HTML, responsive frontend | Modular engineering, design fidelity, DRY principles | [`agents/implementation-engineer.md`](agents/implementation-engineer.md) |
| **09** | **TDD & Test Engineering Specialist** | RED-GREEN-REFACTOR, test seams, test suites | Matt Pocock: `tdd`, `diagnosing-bugs`; Addy Osmani: `tdd` | [`agents/tdd-test-engineer.md`](agents/tdd-test-engineer.md) |
| **10** | **Playwright Browser Engineer** | Viewport QA, real browser automation, traces | Playwright MCP, Playwright CLI, Playwright Test | [`agents/browser-qa.md`](agents/browser-qa.md) |
| **11** | **Security Auditor** | Threat modeling, OWASP Top 10, STRIDE | Addy Osmani: `security-auditor.md` authoritative standard | [`agents/security-auditor.md`](agents/security-auditor.md) |
| **12** | **Web Performance Auditor** | Core Web Vitals, bundle size, metric honesty | Addy Osmani: `web-performance-auditor.md` (Quick/Deep) | [`agents/web-performance-auditor.md`](agents/web-performance-auditor.md) |
| **13** | **SEO & Accessibility Specialist** | WCAG 2.2 AA, semantic hierarchy, metadata | Accessibility tree, screen readers, JSON-LD, SEO | [`agents/seo-accessibility.md`](agents/seo-accessibility.md) |
| **14** | **Code Review & Architecture Reviewer**| Two-dimension code & architecture audit | Matt Pocock: `code-review`, `codebase-design` | [`agents/code-reviewer.md`](agents/code-reviewer.md) |
| **15** | **Production Readiness & Release Reviewer** | Gate consolidation, release verification | Release engineering, operational validation | [`agents/production-reviewer.md`](agents/production-reviewer.md) |

---

## 2. PROJECT OPERATING MODES

The orchestrator inspects the user intent and initiates one of three operating modes:

1. **`NEW_WEBSITE`**: From scratch initiation. Complete 16-stage lifecycle (Grilling → Discovery → Taste → Impeccable → Stitch → Architecture → TDD Implementation → Motion → Browser QA → Security → Perf → A11y/SEO → Release).
2. **`REDESIGN`**: Audit existing website, extract UX debt and visual flaws, generate fresh direction with Taste and Stitch, implement via TDD, run regression browser tests, and release.
3. **`ENHANCE`**: Incremental feature addition or bugfix. Scoped requirements, TDD vertical slice, browser check, targeted security/perf check, and code review.

---

## 3. MANDATORY QUALITY GATES (G1 – G13)

No phase may complete without documented evidence meeting the gate criterion:

```
[G1 Requirements]    --> Critical business & functional ambiguity resolved in REQUIREMENTS.md
[G2 Product]         --> Approved sitemap and user journeys in USER_JOURNEYS.md
[G3 Design Taste]    --> Visual direction approved via Taste Skill; anti-slop rules enforced
[G4 UX/UI Critique]  --> Impeccable heuristic critique completed (P0-P3 prioritized)
[G5 Stitch Design]   --> Generated screen variants & design system tokens reviewed & mapped
[G6 Architecture]    --> Component hierarchy, state model, and tech stack approved
[G7 TDD Verification]--> RED failing test confirmed, GREEN code written, REFACTOR completed
[G8 Motion Quality]  --> Fluid animations (<300ms, natural easing) + `prefers-reduced-motion` verified
[G9 Browser QA]      --> Executed in Playwright across 6 standard viewports; zero horizontal scroll
[G10 Security Audit] --> 0 Critical/High findings; OWASP Top 10 + STRIDE threat model documented
[G11 Performance]    --> CWV metrics recorded honestly; lab vs. static findings segregated
[G12 Accessibility]  --> WCAG 2.2 AA contrast, keyboard navigation, semantic headings verified
[G13 Release Audit]  --> Independent release reviewer sign-off; release artifacts compiled
```

---

## 4. UNIVERSAL COMMAND INTERFACE

Any AI model or human engineer can trigger harness capabilities via either slash commands or npm/node CLI:

| Command | Action | Sub-Agent |
|---|---|---|
| `/website-init` or `npm run harness init` | Initializes project context and runs environment audit | AGENT 01 |
| `/website-grill` or `npm run harness grill` | Starts interactive Socratic requirement grilling | AGENT 02 |
| `/website-discover` or `npm run harness discover` | Compiles sitemap, personas, and user journeys | AGENT 03 |
| `/website-design` or `npm run harness design` | Establishes anti-slop visual direction with Taste Skill | AGENT 04 |
| `/website-stitch` or `npm run harness stitch` | Generates/syncs UI screens and tokens via Stitch MCP/CLI | AGENT 06 |
| `/website-build` or `npm run harness build` | Frontend architectural scaffolding and implementation | AGENT 07, 08 |
| `/website-tdd` or `npm run harness tdd` | Executes strict TDD Red-Green-Refactor development slice | AGENT 09 |
| `/website-motion` or `npm run harness motion` | Integrates micro-interactions and transitions | AGENT 10 |
| `/website-test` or `npm run harness test` | Runs Playwright browser testing on 6 viewports | AGENT 11 |
| `/website-security` or `npm run harness security` | Executes Addy Osmani Security Auditor inspection | AGENT 12 |
| `/website-performance` or `npm run harness perf` | Executes Addy Osmani Web Performance Auditor inspection | AGENT 13 |
| `/website-critique` or `npm run harness critique` | Runs Impeccable 24-command design review | AGENT 05 |
| `/website-audit` or `npm run harness audit` | Comprehensive multi-agent quality audit | ALL AGENTS |
| `/website-release` or `npm run harness release` | Consolidates G1–G13 gates and validates release | AGENT 15 |

---

## 5. REQUIREMENT-TO-TEST TRACEABILITY MATRIX

Every project maintained under this harness must preserve continuous traceability across 6 key artifacts:
1. `REQUIREMENTS.md` — Unique Requirement IDs (`REQ-001`, `REQ-002`...)
2. `ACCEPTANCE_CRITERIA.md` — Testable Gherkin or E2E acceptance criteria
3. `DESIGN_SPECIFICATION.md` — Visual tokens, layout hierarchy, and Stitch screen IDs
4. `COMPONENT_INVENTORY.md` — Frontend component registry and props contracts
5. `TEST_TRACEABILITY_MATRIX.md` — Mapping of REQ -> Component -> Test File -> Status
6. `DEFECT_REGISTER.md` — Log of identified issues with severity (P0 blocker to P3 polish)

---

## 6. STRICT INTEGRITY AND METRIC HONESTY DIRECTIVES

1. **Anti-Slop Visual Law:** No unmotivated purple/blue gradients, no default Inter cards with arbitrary rounded corners, no placeholder content without intent.
2. **Never Fabricate Test Results:** Never claim a browser test, performance metric, or security check succeeded without running the actual tool or script. If a tool lacks network or credentials, state exact blocking dependencies.
3. **No Premature Release Declarations:** Quality Gate G13 cannot be bypassed. Critical/High findings block release.
