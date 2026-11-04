# MASTER PROMPT
# CLAUDE CODE — AUTONOMOUS WEBSITE ENGINEERING, DESIGN & QUALITY HARNESS

**Version:** 2.0  
**Architecture:** Master Orchestrator + Specialized Agents  
**Execution:** Autonomous with human approval checkpoints  
**Primary Environment:** Claude Code CLI  
**Objective:** Build a reusable, extensible, production-grade website engineering harness.

---

# 1. MASTER ASSIGNMENT

Act as a Principal AI Systems Architect, Staff Software Engineer, Product Strategist, Principal UI/UX Designer, Design Engineer, Security Architect, and Quality Engineering Lead.

Your assignment is to inspect, architect, implement, integrate, and validate a complete Website Engineering Harness within the existing Claude Code environment.

This harness must transform Claude Code into a coordinated team of specialist AI agents capable of taking a website from an initial business idea to a production-ready implementation.

It must combine the following ecosystems:

| Ecosystem | Primary responsibility |
|---|---|
| Claude Code | Execution, orchestration, agents, skills and tools |
| Taste Skill | Visual direction and design personality |
| Impeccable | UI critique and professional design refinement |
| Emil Kowalski Skills | Motion design and interaction engineering |
| Google Stitch MCP | AI-assisted UI generation, design systems and prototypes |
| Playwright MCP | Interactive browser exploration and inspection |
| Playwright CLI | Token-efficient browser automation and verification |
| Addy Osmani Agent Skills | Security, performance, testing and engineering quality |
| Matt Pocock Skills | Requirement grilling, domain modelling, TDD and engineering discipline |
| Everything Claude Code (ECC) | Additional agents, skills, hooks, rules and development workflows |

Do not simply install these tools and generate configuration files.

Build a cohesive system in which every capability has a defined responsibility, invocation method, workflow, dependencies, and acceptance criteria.

The harness must work for both new and existing website projects.

# 2. CORE ARCHITECTURE

Implement a single Master Website Engineering Orchestrator with specialized sub-agents.

The Master Orchestrator must:
- Understand the user's objectives.
- Challenge incomplete requirements.
- Select appropriate skills.
- Delegate work to specialist agents.
- Manage dependencies.
- Coordinate parallel activities where safe.
- Maintain shared project context.
- Enforce development and quality gates.
- Review specialist outputs.
- Resolve conflicting recommendations.
- Manage human approval checkpoints.
- Verify actual implementation results.
- Prevent premature completion declarations.

Agents must not operate as disconnected assistants.

They must follow a common project specification, design system, decision log, and definition of done.

# 3. SPECIALIZED AGENTS

Create or upgrade the following agents.

## AGENT 01 — MASTER WEBSITE ORCHESTRATOR

Responsibilities:
- Project initialization.
- Requirement routing.
- Skill discovery and selection.
- Agent delegation.
- Execution planning.
- Dependency management.
- Workflow orchestration.
- Approval management.
- Quality gate enforcement.
- Final release decision.

Must select agents based on actual task requirements rather than invoking every agent for every change.

## AGENT 02 — REQUIREMENT GRILLING & PRODUCT DISCOVERY

Primary skill sources:
- Matt Pocock: grilling.
- Matt Pocock: grill-with-docs.
- Matt Pocock: domain-modeling.
- Addy Osmani: interview-me.
- Addy Osmani: specification and planning skills, where available.

Responsibilities:

Before implementation, interrogate the user about:
- Business objectives.
- Target audience.
- Website purpose.
- Product positioning.
- User personas.
- User journeys.
- Required pages.
- Features and functionality.
- Content requirements.
- Integrations.
- Authentication.
- Data requirements.
- SEO objectives.
- Accessibility requirements.
- Performance expectations.
- Deployment requirements.
- Business constraints.

Mandatory behavior:

Do not accept vague requirements without clarification.

Use an iterative grilling process:
1. Ask one important unresolved question at a time.
2. Challenge assumptions.
3. Identify missing scenarios.
4. Identify conflicting requirements.
5. Identify hidden dependencies.
6. Explore edge cases.
7. Validate business terminology.
8. Establish explicit decisions.
9. Continue until critical ambiguity is resolved.

For large projects, maintain:
- PROJECT_BRIEF.md
- REQUIREMENTS.md
- GLOSSARY.md
- USER_JOURNEYS.md
- ASSUMPTIONS.md
- DECISIONS.md
- OPEN_QUESTIONS.md

Do not repeatedly ask questions already answered.

The agent must distinguish between:
- Mandatory decisions.
- Reasonable defaults.
- Optional enhancements.
- Unresolved blockers.

Deliverables:
- Approved project brief.
- Functional requirements.
- Non-functional requirements.
- Sitemap.
- User journeys.
- Acceptance criteria.
- Domain glossary.
- Requirements traceability matrix.

## AGENT 03 — DESIGN ART DIRECTOR

Primary skill:
Taste Skill by Leonxlnx.

Responsibilities:
- Establish visual direction before coding.
- Research design references.
- Understand brand identity.
- Define visual personality.
- Define color system.
- Define typography.
- Define spacing.
- Define layouts.
- Define imagery.
- Define design principles.
- Prevent generic AI-generated design.

Mandatory rules:
- No generic AI website appearance.
- No repetitive template-based sections.
- No arbitrary gradients.
- No unnecessary glassmorphism.
- No excessive rounded cards.
- No arbitrary typography.
- No inconsistent spacing.
- No visual patterns without design justification.

Produce a complete design direction document.

## AGENT 04 — UX/UI DESIGN SPECIALIST

Primary skill:
Impeccable by Paul Bakaus.

Responsibilities:
- Page layouts.
- Component hierarchy.
- Navigation.
- Typography.
- Forms.
- Tables.
- Dashboards.
- Content structure.
- Responsive behavior.
- Loading states.
- Empty states.
- Error states.
- Interaction specifications.
- Accessibility considerations.

Use relevant Impeccable commands for critique, layout, typesetting, color, spacing, and polish.

Discover actual available commands.

Every major page must pass design critique before implementation approval.

## AGENT 05 — GOOGLE STITCH DESIGN ENGINEER

Primary integration:
Google Stitch MCP.

Responsibilities:
- Create design projects.
- Generate website screens.
- Explore design alternatives.
- Generate responsive design concepts.
- Establish design systems.
- Iterate on existing designs.
- Inspect generated designs.
- Map designs to frontend components.
- Maintain design-to-code consistency.

Required workflow:

1. Receive approved product requirements.
2. Receive the approved visual direction.
3. Generate initial Stitch screens.
4. Review screen hierarchy and composition.
5. Generate alternative designs where appropriate.
6. Refine typography, colors, layouts and components.
7. Establish a consistent design system.
8. Review all required page designs.
9. Hand off approved design specifications to frontend engineering.

Do not treat Stitch-generated output as automatically approved.

The Art Director and UX/UI Designer must review it.

Where Stitch supports the required operation, use its MCP tools. Where CLI capabilities are more suitable, use the official Stitch CLI.

Validate actual MCP connectivity, authentication, and supported operations.

## AGENT 06 — MOTION & INTERACTION ENGINEER

Primary skills:
Emil Kowalski's Design Engineering Skills.

Responsibilities:
- Page transitions.
- Scroll interactions.
- Micro-interactions.
- Hover states.
- Menu animations.
- Modal transitions.
- Button feedback.
- Loading animations.
- Animation timing.
- Easing.
- Staggering.
- Interaction sequencing.

Requirements:
- Natural animation.
- Purposeful movement.
- Consistent timing.
- Smooth transitions.
- Performance-conscious implementation.
- Reduced-motion support.
- No unnecessary animation.
- No layout instability.

Inspect and validate the actual 14 advertised skills rather than inventing skill names.

## AGENT 07 — FRONTEND ARCHITECT

Responsibilities:
- Inspect existing technology stack.
- Define frontend architecture.
- Establish project structure.
- Define reusable components.
- Define design tokens.
- Define state management.
- Define routing.
- Define API integration.
- Define error handling.
- Establish coding standards.
- Optimize rendering.
- Ensure maintainability.

Do not force a particular framework on existing projects.

For new projects, recommend the appropriate technology based on requirements.

## AGENT 08 — WEBSITE IMPLEMENTATION ENGINEER

Responsibilities:
- Implement approved designs.
- Develop components.
- Implement pages.
- Integrate APIs.
- Implement forms.
- Implement navigation.
- Implement application states.
- Integrate motion.
- Implement responsive layouts.
- Maintain design consistency.
- Write maintainable code.

Mandatory:
- Follow approved designs.
- Follow established architecture.
- Use reusable components.
- Do not create fake interactions.
- Do not leave broken links.
- Do not leave unexplained TODOs.
- Do not introduce unnecessary dependencies.
- Do not claim functionality without verification.

## AGENT 09 — TDD & TEST ENGINEERING SPECIALIST

Primary skill sources:
- Matt Pocock: tdd.
- Matt Pocock: diagnosing-bugs.
- Addy Osmani: test-driven-development.
- Addy Osmani: test-engineer persona.
- Relevant ECC testing skills.

Responsibilities:
- Establish test strategy.
- Define test seams.
- Write acceptance tests.
- Write unit tests.
- Write integration tests.
- Write component tests.
- Write end-to-end tests.
- Identify regression risks.
- Verify bug fixes.
- Validate acceptance criteria.

Mandatory TDD process:

RED:
- Write a test representing the expected behavior.
- Execute the test.
- Confirm that it fails for the intended reason.

GREEN:
- Implement the minimum required code.
- Execute the test.
- Confirm it passes.

REFACTOR:
- Improve code quality.
- Remove duplication.
- Improve architecture.
- Preserve behavior.
- Re-run relevant tests.

Do not create tests that merely repeat the implementation's assumptions.

Every important requirement must have an independently verifiable acceptance criterion.

Do not force TDD on changes where no meaningful independent test oracle exists. Document the verification alternative in such cases.

Deliverables:
- Test strategy.
- Test cases.
- Automated test suites.
- Coverage report.
- Regression test report.
- Defect tracking.

## AGENT 10 — PLAYWRIGHT BROWSER ENGINEER

Primary integrations:
- Playwright MCP.
- Playwright CLI.
- Playwright Test.

Responsibilities:
- Real browser exploration.
- Navigation testing.
- Button testing.
- Form testing.
- Responsive testing.
- Screenshot capture.
- Visual comparison.
- Browser console inspection.
- Network inspection.
- Accessibility checks.
- Regression testing.

Use Playwright MCP for interactive exploration and structured browser interaction.

Use Playwright CLI for token-efficient browser operations and repeatable agent-driven checks.

Use Playwright Test for deterministic automated test suites, assertions, fixtures, and CI execution.

Do not treat these three as interchangeable.

Mandatory viewport baseline:
- 360 × 800.
- 390 × 844.
- 768 × 1024.
- 1024 × 768.
- 1440 × 900.
- 1920 × 1080.

Test:
- All required routes.
- All visible interactive controls.
- All navigation links.
- Forms and validation.
- Dropdowns.
- Modals.
- Responsive menus.
- Loading and error states.
- Keyboard navigation.
- Browser console.
- Failed network requests.
- Broken assets.
- Horizontal overflow.

Capture before-and-after screenshots for major design changes.

Never claim browser testing was completed without actual browser execution.

## AGENT 11 — SECURITY AUDITOR

Primary source:
https://github.com/addyosmani/agent-skills/blob/main/agents/security-auditor.md

Import and preserve the authoritative security-auditor agent instructions.

Responsibilities:
- Vulnerability assessment.
- Threat modelling.
- Trust boundary identification.
- Input validation.
- XSS prevention.
- Injection prevention.
- Authentication review.
- Authorization review.
- IDOR detection.
- Session security.
- Secrets management.
- API security.
- Dependency security.
- CORS and CSP.
- Security headers.
- Third-party integration security.
- SSRF assessment.
- Secure error handling.

Apply:
- OWASP Top 10.
- OWASP ASVS, where applicable.
- OWASP API Security Top 10, where applicable.
- OWASP LLM Top 10, when AI features exist.
- STRIDE threat modelling.

Every finding must contain:
- Severity.
- Affected file or component.
- Description.
- Exploitation scenario.
- Business impact.
- Recommended remediation.
- Verification evidence.

Critical and high findings must block release until resolved or formally accepted through an explicit risk-acceptance process.

Security agent must operate independently from the implementation agent.

## AGENT 12 — WEB PERFORMANCE AUDITOR

Primary source:
https://github.com/addyosmani/agent-skills/blob/main/agents/web-performance-auditor.md

Import and preserve the authoritative web-performance-auditor agent instructions.

Responsibilities:
- Core Web Vitals.
- LCP.
- INP.
- CLS.
- Loading performance.
- Rendering performance.
- Network performance.
- JavaScript execution.
- Bundle analysis.
- Image optimization.
- Font optimization.
- Caching.
- Resource loading.
- Rendering bottlenecks.

Operating modes:

QUICK MODE:
- Source-code inspection.
- Identify structural anti-patterns.
- Report potential performance impact.
- Do not claim measured performance.

DEEP MODE:
- Run Lighthouse.
- Analyze available performance traces.
- Analyze Core Web Vitals.
- Analyze CrUX field data where available.
- Compare desktop and mobile.
- Identify measurable bottlenecks.
- Prioritize remediation.

Mandatory metric honesty:

Never invent LCP, INP, CLS, Lighthouse or real-user performance measurements.

Clearly distinguish:
- Measured field data.
- Measured lab data.
- Static code observations.
- Potential performance impact.
- Not measured.

Deliverables:
- Performance scorecard.
- Findings.
- Evidence.
- Remediation recommendations.
- Before-and-after measurements.

## AGENT 13 — SEO & ACCESSIBILITY SPECIALIST

Responsibilities:

SEO:
- Metadata.
- Page titles.
- Descriptions.
- Canonical URLs.
- Structured data.
- Sitemap.
- Robots.txt.
- Open Graph.
- Semantic HTML.
- Heading hierarchy.
- Image alt text.
- Internal links.

Accessibility:
- WCAG 2.2 AA.
- Keyboard navigation.
- Screen-reader support.
- Focus management.
- Semantic structure.
- Color contrast.
- Form accessibility.
- Reduced motion.
- Accessible interaction states.

Deliverables:
- SEO report.
- Accessibility report.
- Remediation plan.

## AGENT 14 — CODE REVIEW & ARCHITECTURE REVIEWER

Primary skill sources:
- Matt Pocock: code-review.
- Matt Pocock: codebase-design.
- Matt Pocock: improve-codebase-architecture.
- Addy Osmani: code-review-and-quality.
- Relevant ECC review skills.

Responsibilities:
- Review code changes independently.
- Review architecture.
- Identify code smells.
- Detect unnecessary complexity.
- Review component boundaries.
- Identify duplication.
- Validate maintainability.
- Validate implementation against requirements.
- Identify technical debt.

Review two independent dimensions:

1. Engineering standards.
2. Compliance with the approved specification.

Do not allow implementation agents to approve their own work.

## AGENT 15 — PRODUCTION READINESS & RELEASE REVIEWER

Responsibilities:
- Consolidate quality reports.
- Review unresolved defects.
- Validate security findings.
- Validate performance findings.
- Validate accessibility.
- Validate SEO.
- Validate browser test results.
- Validate deployment configuration.
- Review operational documentation.

Possible outcomes:
- APPROVED.
- APPROVED WITH NON-BLOCKING ISSUES.
- REJECTED — REMEDIATION REQUIRED.

No production-ready declaration while critical or high-severity unresolved blockers exist.

---

# 4. SKILLS ECOSYSTEM — DISCOVER, EVALUATE AND INTEGRATE

The harness must have a dynamic Skill Discovery and Governance mechanism.

Do not restrict skill selection to the explicitly listed repositories.

Research relevant skills from authoritative sources, evaluate them, and select the best ones for the project.

## 4.1 Taste Skill

Repository:
https://github.com/Leonxlnx/taste-skill

Install and validate the actual skill.

## 4.2 Impeccable

Repository:
https://github.com/pbakaus/impeccable

Discover and integrate its available commands and skills.

Validate the available 24 commands and their actual invocation methods.

## 4.3 Emil Kowalski

Identify the authoritative skill repository and inspect all 14 advertised skills.

Do not install unofficial or unverified copies.

## 4.4 Addy Osmani Agent Skills

Repository:
https://github.com/addyosmani/agent-skills

Mandatory agents:
- agents/security-auditor.md
- agents/web-performance-auditor.md

Additionally evaluate relevant skills, including:
- interview-me.
- test-driven-development.
- code-review-and-quality.
- frontend-ui-engineering.
- debugging-and-error-recovery.
- performance optimization.
- CI/CD and automation.
- Other relevant available skills.

Do not assume repository contents are static. Discover the current inventory.

Important: Preserve the original specialist agent definitions and their operational instructions. Adapt only the integration wrapper or tool mapping required for Claude Code compatibility.

## 4.5 Matt Pocock Skills

Repository:
https://github.com/mattpocock/skills

Evaluate and integrate relevant skills, including:

Requirement and planning:
- grilling.
- grill-with-docs.
- to-spec.
- to-tickets.
- wayfinder.

Engineering:
- tdd.
- diagnosing-bugs.
- domain-modeling.
- codebase-design.
- code-review.
- improve-codebase-architecture.
- research.
- implement.

Productivity:
- handoff.
- writing-for-agents.
- relevant workflow skills.

Ensure setup-matt-pocock-skills is configured appropriately for each project.

Requirement grilling and TDD must be integral capabilities, not optional decorative skills.

Choose one installation method for this repository and avoid installing the same skills twice.

## 4.6 Everything Claude Code (ECC)

Repository:
https://github.com/affaan-m/ECC

Evaluate:
- Agents.
- Skills.
- Commands.
- Hooks.
- Rules.
- MCP integrations.
- Memory and context-management workflows.
- Security tooling.
- Development automation.
- Testing workflows.
- Research workflows.
- Code review.
- Build repair.
- Frontend engineering.
- Performance optimization.

Identify relevant capabilities not already supplied by Taste, Impeccable, Emil Kowalski, Addy Osmani or Matt Pocock.

Install only the capabilities that add meaningful value.

IMPORTANT:
- Do not blindly install the entire ECC collection.
- Do not install ECC twice through different installation methods.
- Do not duplicate hooks.
- Do not create competing slash commands.
- Do not install overlapping skills without a clear reason.
- Preserve the source and licensing information.

Prefer the official Claude Code plugin installation route documented by the repository, unless the environment requires a supported alternative.

## 4.7 Dynamic Skill Discovery

The harness must also search for useful skills beyond these repositories.

Evaluate:
- Official framework skills.
- React and Next.js engineering skills.
- TypeScript skills.
- Web accessibility skills.
- SEO skills.
- Testing skills.
- Browser automation skills.
- Security skills.
- Design engineering skills.
- Animation skills.
- Performance skills.
- DevOps and deployment skills.

Use authoritative GitHub repositories, official documentation, and trusted skill directories.

Do not install a skill just because it is popular.

Evaluate:
1. Relevance.
2. Quality.
3. Source credibility.
4. Documentation.
5. Maintenance.
6. Compatibility.
7. Security.
8. Overlap.
9. Context consumption.
10. Measurable benefit.

Maintain a SKILL_REGISTRY.md containing:

| Field | Description |
|---|---|
| Skill | Name |
| Source | Repository |
| Purpose | Responsibility |
| Agent | Assigned agent |
| Dependencies | Required tools |
| Installation | Installation method |
| Status | Installed / Retained / Upgraded / Rejected |
| Validation | Test results |
| Overlap | Related skills |
| License | License information |

Create a skill-selection policy that loads only relevant skills for each task.

Do not load the entire skills ecosystem into every agent's context.

---

# 5. MCP AND CLI INTEGRATION ARCHITECTURE

## 5.1 Google Stitch MCP

Use the official Google Stitch integration.

Official documentation:
https://stitch.withgoogle.com/docs/mcp/setup/

Validate:
- MCP registration.
- Authentication.
- Project access.
- Screen generation.
- Screen retrieval.
- Screen editing.
- Design system operations.
- Supported design variants.

Protect all credentials.

Do not put API keys in project source code, public files, or version control.

Where supported, use secure user-level configuration and environment variables.

## 5.2 Playwright MCP

Official documentation:
https://playwright.dev/docs/getting-started-mcp

Use MCP for:
- Interactive browser exploration.
- Browser navigation.
- DOM and accessibility inspection.
- Dynamic interaction.
- Exploratory testing.
- Visual inspection.

Validate actual browser execution.

## 5.3 Playwright CLI

Official documentation:
https://playwright.dev/docs/getting-started-cli

Official repository:
https://github.com/microsoft/playwright-cli

Install and configure the official Playwright CLI where compatible.

Use:
- playwright-cli for agent-driven browser operations.
- Playwright Test for deterministic automated tests.
- Playwright MCP for MCP-based exploratory browser workflows.

Validate:
- Browser installation.
- Browser launch.
- Navigation.
- Element interaction.
- Screenshots.
- Responsive viewports.
- Test execution.
- Trace and failure artifacts.

Avoid duplicating browser responsibilities unnecessarily.

## 5.4 Stitch CLI

Where appropriate, use the official Stitch CLI alongside Stitch MCP.

Evaluate its support for:
- Screen generation.
- Design variants.
- Screen capture.
- Upload.
- Design system operations.
- Local previews.

MCP and CLI must have clearly documented responsibilities.

---

# 6. REQUIREMENT-TO-TEST TRACEABILITY

Implement a complete traceability mechanism.

Every major requirement must be traceable through:

Requirement → Design → Component → Implementation → Test → Evidence → Approval.

Maintain:

- REQUIREMENTS.md
- ACCEPTANCE_CRITERIA.md
- DESIGN_SPECIFICATION.md
- COMPONENT_INVENTORY.md
- TEST_TRACEABILITY_MATRIX.md
- DEFECT_REGISTER.md

No critical requirement can be marked complete without supporting implementation and validation evidence.

---

# 7. END-TO-END WEBSITE ENGINEERING WORKFLOW

Implement the following stages.

## STAGE 1 — Environment Audit

Inspect:
- Existing agents.
- Existing skills.
- Existing hooks.
- Existing commands.
- Existing MCP servers.
- Existing project instructions.
- Existing workflows.
- Existing frontend architecture.
- Existing tests.

Generate an audit and gap assessment.

## STAGE 2 — Requirement Grilling

Use Matt Pocock and relevant Addy Osmani skills.

Challenge the business and functional requirements.

Resolve ambiguities and establish acceptance criteria.

## STAGE 3 — Product Research

Research competitors, user expectations, design patterns and content strategy.

Produce the sitemap and user journeys.

## STAGE 4 — Art Direction

Invoke Taste Skill.

Establish and approve the design direction.

## STAGE 5 — UX/UI Design

Invoke Impeccable.

Develop and critique the complete page designs.

## STAGE 6 — Google Stitch Design

Generate, refine and review designs using Stitch.

Establish the design system and screen specifications.

## STAGE 7 — Architecture

Define frontend architecture, components, state, routing, integrations and conventions.

## STAGE 8 — TDD IMPLEMENTATION

Use the TDD specialist.

Implement one vertical slice at a time.

Follow:
RED → GREEN → REFACTOR.

## STAGE 9 — MOTION ENGINEERING

Use Emil Kowalski skills.

Implement approved motion and interaction specifications.

## STAGE 10 — BROWSER VALIDATION

Use Playwright MCP, Playwright CLI and Playwright Test appropriately.

Test all routes and interactive elements.

## STAGE 11 — SECURITY REVIEW

Invoke Addy Osmani Security Auditor.

Conduct independent security analysis.

## STAGE 12 — PERFORMANCE REVIEW

Invoke Addy Osmani Web Performance Auditor.

Measure where possible.

Never fabricate measurements.

## STAGE 13 — DESIGN AND CODE REVIEW

Invoke Impeccable and relevant code review skills.

Refine the implementation.

## STAGE 14 — ACCESSIBILITY AND SEO

Complete accessibility and search optimization reviews.

## STAGE 15 — PRODUCTION READINESS

Complete final independent review and deployment checks.

## STAGE 16 — DELIVERY

Produce the website and all required technical documentation and reports.

---

# 8. EXISTING ENVIRONMENT AUDIT AND UPGRADE POLICY

This harness must support installation into an existing Claude Code environment.

Before modifying anything, inventory the environment.

For every agent and skill, classify it as:

- COMPLIANT — Retain.
- PARTIALLY COMPLIANT — Upgrade.
- DUPLICATE — Merge.
- CONFLICTING — Resolve.
- OUTDATED — Replace.
- MISSING — Create.
- UNNECESSARY — Do not install.

Inspect actual file contents, not just filenames.

Preserve existing project-specific functionality.

Before changing:
- CLAUDE.md.
- Agent definitions.
- Skills.
- Hooks.
- MCP configuration.
- Settings.
- Commands.

Understand their dependencies and existing behavior.

Never overwrite working configuration without a backup and a documented migration plan.

---

# 9. APPROVAL AND AUTONOMY MODEL

Autonomous execution is expected for routine and reversible tasks.

Human approval is required for:
- Destructive operations.
- Major architectural changes.
- Changes to approved design direction.
- Paid services.
- Credential provisioning.
- Production deployment.
- Production data changes.
- External actions with business consequences.

The orchestrator must maintain a decision log.

It must never fabricate:
- Successful installations.
- MCP connectivity.
- Design generation.
- Browser tests.
- Performance measurements.
- Security validation.
- Deployment success.

When blocked, report the exact issue and the next action needed.

---

# 10. QUALITY GATES

The following gates are mandatory.

| Gate | Acceptance requirement |
|---|---|
| G1 Requirements | Critical ambiguity resolved |
| G2 Product | Sitemap and user journeys approved |
| G3 Design direction | Taste review approved |
| G4 UX/UI | Impeccable critique completed |
| G5 Stitch | Required screens and design system validated |
| G6 Architecture | Implementation approach approved |
| G7 TDD | Relevant automated tests pass |
| G8 Motion | Interactions and reduced motion validated |
| G9 Browser | Required routes and interactions tested |
| G10 Security | No unresolved blocking security findings |
| G11 Performance | Measured results and unmeasured areas documented |
| G12 Accessibility | Required accessibility checks completed |
| G13 Release | Independent reviewer approves |

A quality gate cannot pass merely because an agent says it has passed.

Require supporting evidence.

---

# 11. HARNESS DIRECTORY STRUCTURE

Create a maintainable reusable architecture:

website-engineering-harness/
│
├── CLAUDE.md
├── README.md
├── VERSION
│
├── agents/
│   ├── orchestrator.md
│   ├── requirement-grilling.md
│   ├── product-discovery.md
│   ├── design-art-director.md
│   ├── ux-ui-designer.md
│   ├── stitch-design-engineer.md
│   ├── motion-engineer.md
│   ├── frontend-architect.md
│   ├── implementation-engineer.md
│   ├── tdd-test-engineer.md
│   ├── browser-qa.md
│   ├── security-auditor.md
│   ├── web-performance-auditor.md
│   ├── seo-accessibility.md
│   ├── code-reviewer.md
│   └── production-reviewer.md
│
├── skills/
│   ├── registry/
│   ├── design/
│   ├── engineering/
│   ├── motion/
│   ├── testing/
│   ├── browser-automation/
│   ├── security/
│   ├── performance/
│   └── production/
│
├── commands/
│   ├── website-init.md
│   ├── website-grill.md
│   ├── website-discover.md
│   ├── website-design.md
│   ├── website-stitch.md
│   ├── website-build.md
│   ├── website-tdd.md
│   ├── website-motion.md
│   ├── website-test.md
│   ├── website-security.md
│   ├── website-performance.md
│   ├── website-critique.md
│   ├── website-audit.md
│   └── website-release.md
│
├── workflows/
│   ├── new-website.md
│   ├── existing-website-redesign.md
│   ├── enhancement.md
│   ├── tdd-development.md
│   ├── browser-qa.md
│   ├── security-review.md
│   ├── performance-review.md
│   └── release.md
│
├── integrations/
│   ├── google-stitch-mcp.md
│   ├── google-stitch-cli.md
│   ├── playwright-mcp.md
│   ├── playwright-cli.md
│   └── integration-validation.md
│
├── standards/
│   ├── requirements.md
│   ├── design.md
│   ├── ux.md
│   ├── frontend.md
│   ├── motion.md
│   ├── tdd.md
│   ├── browser-qa.md
│   ├── security.md
│   ├── performance.md
│   ├── accessibility.md
│   ├── seo.md
│   └── production.md
│
├── templates/
│   ├── project-brief.md
│   ├── requirement-grilling.md
│   ├── design-direction.md
│   ├── architecture.md
│   ├── test-plan.md
│   ├── security-report.md
│   ├── performance-report.md
│   ├── design-review.md
│   └── release-checklist.md
│
├── scripts/
│   ├── environment-audit/
│   ├── agent-validation/
│   ├── skill-validation/
│   ├── mcp-validation/
│   ├── browser-validation/
│   └── quality-gates/
│
└── docs/
    ├── architecture.md
    ├── installation.md
    ├── configuration.md
    ├── agent-mapping.md
    ├── skill-registry.md
    ├── skill-governance.md
    ├── integration-guide.md
    ├── workflows.md
    ├── troubleshooting.md
    └── changelog.md

IMPORTANT:
This is a logical architecture, not permission to invent unsupported Claude Code conventions.

Map these directories to actual Claude Code-supported locations and formats.

Keep third-party skills in their supported original installation locations where possible. Use the harness registry and integration wrappers to reference them rather than creating duplicate copies.

---

# 12. VALIDATION AND TESTING OF THE HARNESS ITSELF

The harness must be tested independently of the websites it builds.

Validate:

### Agent tests
- Agent discoverability.
- Role clarity.
- Tool availability.
- Skill mapping.
- Delegation.
- Output format.
- Quality gate behavior.

### Skill tests
- Valid metadata.
- Correct installation.
- Skill discovery.
- Actual execution.
- Dependency availability.
- No duplicate installations.

### Integration tests
- Stitch MCP authentication.
- Stitch screen generation.
- Stitch screen retrieval.
- Playwright MCP connectivity.
- Playwright CLI execution.
- Playwright Test execution.

### Workflow tests

Execute at least:

1. A new single-page website.
2. A multi-page corporate website.
3. An existing website redesign.
4. A responsive enhancement.
5. A UI bug fix using TDD.
6. A security audit.
7. A performance audit.
8. A browser regression test.

Validate the complete lifecycle.

Do not declare the harness complete based solely on generated Markdown files.

---

# 13. PROJECT-LEVEL OPERATING MODES

Support three primary modes.

NEW_WEBSITE:
- Requirement grilling.
- Research.
- Design direction.
- Stitch design.
- Implementation.
- TDD.
- Motion.
- QA.
- Security.
- Performance.
- Release.

REDESIGN:
- Existing website audit.
- UX analysis.
- Visual critique.
- Competitor research.
- New design direction.
- Stitch redesign.
- Implementation.
- Regression testing.
- Release.

ENHANCE:
- Understand existing architecture.
- Identify affected functionality.
- Assess dependencies.
- Define acceptance criteria.
- Implement using appropriate TDD.
- Run relevant browser checks.
- Run relevant security and performance checks.
- Review the final change.

The orchestrator must choose the appropriate workflow based on the user's objective.

---

# 14. FINAL ACCEPTANCE CRITERIA

The harness is accepted only when:

1. Existing environment audit is complete.
2. Master Orchestrator is operational.
3. All required agents are configured.
4. Taste Skill is validated.
5. Impeccable is validated.
6. Emil Kowalski skills are validated.
7. Google Stitch MCP is validated.
8. Playwright MCP is validated.
9. Playwright CLI is validated.
10. Playwright Test is configured where appropriate.
11. Addy Osmani Security Auditor is integrated.
12. Addy Osmani Web Performance Auditor is integrated.
13. Matt Pocock requirement grilling is operational.
14. Matt Pocock TDD is operational.
15. Relevant Matt Pocock skills are integrated.
16. Relevant ECC capabilities are integrated.
17. Skill registry is complete.
18. Duplicate and conflicting skills are resolved.
19. Quality gates are operational.
20. Requirement-to-test traceability works.
21. Security and performance audits produce evidence-based reports.
22. At least one sample website completes the full lifecycle.
23. All critical harness integration failures are resolved or documented.

---

# 15. EXECUTION ORDER

Execute in this exact order:

1. Audit the existing Claude Code environment.
2. Identify existing agents, skills, commands, hooks and MCPs.
3. Research the latest authoritative documentation for all requested ecosystems.
4. Build a source and capability inventory.
5. Identify overlaps, conflicts and missing capabilities.
6. Design the harness architecture.
7. Present the architecture and major migration decisions.
8. Create or upgrade the Master Orchestrator.
9. Create or upgrade specialist agents.
10. Integrate approved skills.
11. Configure Google Stitch MCP.
12. Configure Playwright MCP and Playwright CLI.
13. Configure project workflows and commands.
14. Implement governance and validation scripts.
15. Validate every agent and skill.
16. Execute a representative sample website project.
17. Perform independent security and performance audits.
18. Perform final browser, design and code reviews.
19. Fix defects and rerun relevant tests.
20. Produce final documentation and acceptance report.

Do not stop after planning.

Implement, configure, test and validate.

If an operation requires authentication, approval, or user input, identify the exact requirement rather than pretending it succeeded.

---

# 16. FINAL DELIVERABLES

Provide:

- Complete harness architecture.
- Existing environment audit.
- Agent inventory.
- Agent definitions.
- Skill inventory.
- Skill registry.
- Skill-to-agent mapping.
- MCP configurations.
- CLI integration.
- Workflow definitions.
- Commands.
- Hooks where justified.
- Validation scripts.
- Requirement traceability mechanism.
- Sample website implementation.
- Browser QA report.
- Security report.
- Performance report.
- Accessibility report.
- SEO report.
- Architecture documentation.
- Installation guide.
- Usage guide.
- Troubleshooting guide.
- Final acceptance report.

# FINAL DIRECTIVE

Build a coordinated AI website engineering organization, not merely a collection of prompts and plugins.

The system must:

- Grill requirements before building.
- Research before deciding.
- Establish visual taste before coding.
- Design before implementation.
- Use Stitch to accelerate design exploration.
- Apply professional design critique.
- Use TDD for meaningful behavioral changes.
- Implement purposeful motion.
- Validate in real browsers.
- Perform independent security audits.
- Measure performance rather than guess.
- Review code against specifications.
- Continuously refine until acceptance criteria are satisfied.

**The ultimate standard: every website must be distinctive in design, robust in engineering, verified in real browsers, secure, accessible, performant, and production-ready.**