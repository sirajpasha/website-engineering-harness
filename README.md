# Universal Autonomous Website Engineering, Design & Quality Harness

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](VERSION)
[![Quality Gates](https://img.shields.io/badge/quality%20gates-G1--G13-brightgreen.svg)](standards/)
[![AI Compatibility](https://img.shields.io/badge/AI%20Compatibility-Universal-orange.svg)](AGENTS.md)

A production-grade, extensible multi-agent harness that turns any AI coding assistant (**Claude Code, Gemini / Antigravity, OpenAI Codex / Copilot, Cursor, Windsurf, Aider, OpenCode**) into a coordinated engineering organization capable of taking a website from initial business idea to production-verified release.

---

## 🌟 Ecosystem Unification

This harness integrates the finest engineering and design practices into a unified orchestration framework:

| Ecosystem | Role & Contribution |
|---|---|
| **Claude Code / Universal Agent Protocol** | Orchestration, sub-agent delegation, slash commands, tool execution |
| **Taste Skill (`Leonxlnx/taste-skill`)** | Visual art direction, anti-slop rules, distinctive aesthetic personalities |
| **Impeccable (`pbakaus/impeccable`)** | 24-command design vocabulary, heuristic UX critique, layout & typographic polish |
| **Emil Kowalski Skills** | 14 motion & interaction engineering skills, natural springs, reduced-motion |
| **Google Stitch MCP & CLI** | AI UI generation, screen variants, design token export, visual prototyping |
| **Playwright MCP, CLI & Test** | Real browser validation across 6 mandatory viewports (360px to 1920px) |
| **Addy Osmani Agent Skills** | Authoritative Security Auditor (OWASP/STRIDE) & Web Performance Auditor (CWV) |
| **Matt Pocock Skills** | Socratic requirement grilling, domain modeling, strict TDD Red-Green-Refactor |
| **Everything Claude Code (ECC)** | Production workflows, quality gates, and agent handoff protocols |

---

## 🏛️ System Architecture

```
website-engineering-harness/
├── AGENTS.md                  # Universal Multi-Agent Specification
├── CLAUDE.md                  # Claude Code CLI configuration & directives
├── GEMINI.md                  # Gemini CLI / Antigravity configuration
├── .cursorrules               # Cursor IDE agent instructions
├── .windsurfrules             # Windsurf IDE agent instructions
├── .github/                   # GitHub Copilot & Codex workspace rules
├── mcp.json                   # Universal MCP server bindings (Stitch, Playwright)
│
├── agents/                    # 16 Specialized Agent Definitions
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
├── skills/                    # Unified Skills Ecosystem
│   ├── registry/              # SKILL_REGISTRY.md & Governance Policy
│   ├── design/                # Taste Skill & Impeccable integration wrappers
│   ├── engineering/           # Component architectures, contracts, conventions
│   ├── motion/                # Emil Kowalski motion curves & gesture patterns
│   ├── testing/               # TDD Red-Green-Refactor runners & test seams
│   ├── browser-automation/    # Playwright multi-viewport fixtures & screenshot rules
│   ├── security/              # OWASP Top 10 checklist & STRIDE templates
│   ├── performance/           # Core Web Vitals audit modes & metric honesty
│   └── production/            # Release readiness checklists & gate auditors
│
├── commands/                  # 14 Standard Workflow Commands
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
├── workflows/                 # 8 End-to-End Execution Workflows
│   ├── new-website.md
│   ├── existing-website-redesign.md
│   ├── enhancement.md
│   ├── tdd-development.md
│   ├── browser-qa.md
│   ├── security-review.md
│   ├── performance-review.md
│   └── release.md
│
├── integrations/              # MCP & CLI Integration Guides & Configurations
│   ├── google-stitch-mcp.md
│   ├── google-stitch-cli.md
│   ├── playwright-mcp.md
│   ├── playwright-cli.md
│   └── integration-validation.md
│
├── standards/                 # 12 Authoritative Quality Standards
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
├── templates/                 # 10 Traceability & Engineering Document Templates
│   ├── project-brief.md
│   ├── requirement-grilling.md
│   ├── design-direction.md
│   ├── architecture.md
│   ├── test-plan.md
│   ├── security-report.md
│   ├── performance-report.md
│   ├── design-review.md
│   ├── release-checklist.md
│   └── requirements-traceability.md
│
├── scripts/                   # Executable Cross-Platform CLI & Validation Tooling
│   ├── website-engineering-harness-cli.js         # Master CLI runner
│   ├── environment-audit/     # System capability & dependency auditor
│   ├── agent-validation/      # Agent discoverability & contract tester
│   ├── skill-validation/      # Skill registry & dependency validator
│   ├── mcp-validation/        # Stitch & Playwright MCP tester
│   ├── browser-validation/    # Playwright 6-viewport automation engine
│   ├── quality-gates/         # Gates G1-G13 automated validator
│   └── traceability/          # Requirement-to-test traceability verifier
│
├── docs/                      # Complete Technical Documentation & Guides
│   ├── architecture.md
│   ├── installation.md
│   ├── configuration.md
│   ├── agent-mapping.md
│   ├── skill-registry.md
│   ├── skill-governance.md
│   ├── integration-guide.md
│   ├── workflows.md
│   ├── troubleshooting.md
│   ├── changelog.md
│   └── acceptance-report.md
│
└── examples/                  # Reference Implementations
    └── sample-website/        # Fully implemented, production-verified sample website
```

---

## 🚦 The 13 Quality Gates (G1 - G13)

No website is shipped until every gate provides objective evidence:

1. **G1 Requirements:** Ambiguity grilling resolved in `REQUIREMENTS.md`.
2. **G2 Product:** Approved IA sitemap and user journeys in `USER_JOURNEYS.md`.
3. **G3 Design Direction:** Taste Skill anti-slop visual identity approved.
4. **G4 UX/UI:** Impeccable 24-command heuristic review completed (scored out of 40).
5. **G5 Stitch:** AI screen variants and design tokens integrated.
6. **G6 Architecture:** Component contracts, routing, and state model signed off.
7. **G7 TDD:** Red-Green-Refactor verified with passing automated unit/integration tests.
8. **G8 Motion:** Emil Kowalski physics, micro-interactions, and reduced-motion validated.
9. **G9 Browser QA:** Playwright tests passing on all 6 viewports with zero horizontal overflow.
10. **G10 Security:** OWASP Top 10 + STRIDE audit with 0 Critical/High findings.
11. **G11 Performance:** Core Web Vitals measured with strict metric honesty.
12. **G12 Accessibility & SEO:** WCAG 2.2 AA contrast/keyboard checks and JSON-LD metadata verified.
13. **G13 Release Review:** Independent production sign-off.

---

## 🚀 Remote Machine Setup & Usage

If you or a team member wants to use `website-engineering-harness` to create a website on a remote machine, choose one of the following methods:

### Option 1: Git Clone / GitHub Template (Recommended)
1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/website-engineering-harness.git my-new-website
   cd my-new-website
   ```
2. **Install dependencies and verify environment:**
   ```bash
   npm install
   npm run audit
   ```
3. **Open with your preferred AI tool** (see the tool-specific guides below) or launch via terminal:
   ```bash
   npm run website-engineering-harness init
   ```

*(Tip: On GitHub, navigate to **Settings** and mark this repository as a **"Template repository"**. Anyone can then click **"Use this template"** to create an instant new website repo).*

---

### Option 2: Global CLI Installation
Install the harness CLI globally on any remote machine directly from Git:
```bash
# Install globally
npm install -g git+https://github.com/<your-username>/website-engineering-harness.git

# Run commands anywhere:
website-engineering-harness init
website-engineering-harness grill
website-engineering-harness design
website-engineering-harness critique
website-engineering-harness build
website-engineering-harness tdd
website-engineering-harness test:browser
website-engineering-harness security
website-engineering-harness perf
website-engineering-harness gates
website-engineering-harness release
```

---

### Option 3: Drop-In for Existing Websites (`REDESIGN` or `ENHANCE` Mode)
To apply this harness to an existing website on a remote machine:
1. Copy `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `mcp.json`, `agents/`, `skills/`, `standards/`, and `scripts/` into the existing project root.
2. Run audit:
   ```bash
   website-engineering-harness audit
   ```
3. The Master Orchestrator automatically detects the existing codebase and engages:
   - **`REDESIGN` Mode:** Catalogs UX debt in `DEFECT_REGISTER.md`, applies Impeccable critique, and crafts an anti-slop visual refresh via Taste Skill.
   - **`ENHANCE` Mode:** Implements a scoped feature or bugfix slice under strict TDD and browser regression checks.

---

## 🤖 AI Tool Integration Guides

Click each collapsible section below for exact setup and invocation instructions:

<details>
<summary><b>Using with Claude Code CLI</b></summary>

### Overview
Claude Code CLI has native first-class integration with this harness. When launched in the repository, it automatically reads [`CLAUDE.md`](CLAUDE.md), discovers all 16 agents in [`.claude/agents/`](.claude/agents/), and registers the 14 slash commands in [`.claude/commands/`](.claude/commands/).

### How to Run
1. Open terminal in the project directory:
   ```bash
   claude
   ```
2. Run the slash commands in sequence:
   - `/website-init`: Audits runtime capabilities and scaffolds project context.
   - `/website-grill`: Socratic requirements grilling (AGENT 02).
   - `/website-discover`: Generates user journeys, personas, and sitemap (AGENT 03).
   - `/website-design`: Establishes anti-slop art direction and design tokens (AGENT 04).
   - `/website-critique`: Impeccable 24-command heuristic review (AGENT 05).
   - `/website-stitch`: Generates screens & tokens via Stitch MCP (AGENT 06).
   - `/website-build`: Frontend scaffolding and component implementation (AGENT 08/09).
   - `/website-tdd`: Executes Red-Green-Refactor development slice (AGENT 10).
   - `/website-motion`: Emil Kowalski micro-interactions and transitions (AGENT 07).
   - `/website-test`: Cross-viewport Playwright verification across 6 viewports (AGENT 11).
   - `/website-security`: OWASP Top 10 & STRIDE threat audit (AGENT 12).
   - `/website-performance`: Core Web Vitals audit with metric honesty (AGENT 13).
   - `/website-audit`: Full-suite quality audit across G1–G13 gates.
   - `/website-release`: Quality gate G13 audit and production release sign-off (AGENT 16).

### Example Prompt
> *"Run /website-grill. I want to build a high-craft developer documentation and API platform for financial institutions."*
</details>

<details>
<summary><b>Using with OpenAI Codex & GitHub Copilot</b></summary>

### Overview
Codex and GitHub Copilot utilize workspace context and instructions. The harness provides [`.github/copilot-instructions.md`](.github/copilot-instructions.md) and [`AGENTS.md`](AGENTS.md) as the authoritative multi-agent directives.

### How to Run
1. Open the project in VS Code with the GitHub Copilot extension active.
2. Copilot automatically loads `.github/copilot-instructions.md` as custom workspace instructions.
3. In Copilot Chat (or Codex agent interface), invoke the Orchestrator with structured task instructions:
   - *"Act as Master Website Orchestrator from AGENTS.md. Initiate project mode NEW_WEBSITE for an architectural design studio."*
   - *"Adopt AGENT 02 (Requirement Grilling Specialist). Review REQUIREMENTS.md and ask me the highest-priority unresolved question."*
   - *"Adopt AGENT 04 (Design Art Director). Follow skills/design/taste-skill.md to define the DESIGN_TOKENS.json palette and typography."*
   - *"Adopt AGENT 10 (TDD Specialist). Write a failing test in tests/ for REQ-003, then implement the component to make it green."*
4. Run validation scripts directly in the integrated terminal:
   ```bash
   website-engineering-harness validate
   website-engineering-harness test:browser
   website-engineering-harness gates
   ```
</details>

<details>
<summary><b>Using with Gemini CLI / Google Antigravity</b></summary>

### Overview
Gemini CLI and Google Antigravity ingest [`GEMINI.md`](GEMINI.md) and [`AGENTS.md`](AGENTS.md) at startup, automatically establishing the Master Website Orchestrator persona.

### How to Run
1. Launch Gemini CLI or open the workspace in Antigravity:
   ```bash
   gemini
   # or
   agy
   ```
2. The agent will confirm compliance with `AGENTS.md` and `GEMINI.md`.
3. Command the Orchestrator:
   - *"Start a new website project: [describe your website idea]"*
   - *"Run Stage 2: Requirement Grilling using agents/requirement-grilling.md."*
   - *"Audit Quality Gates: run node scripts/quality-gates/check-gates.js."*
4. Subagents can be invoked directly:
   - Grilling -> [`agents/requirement-grilling.md`](agents/requirement-grilling.md)
   - Art Direction -> [`agents/design-art-director.md`](agents/design-art-director.md)
   - UI Critique -> [`agents/ux-ui-designer.md`](agents/ux-ui-designer.md)
   - Motion -> [`agents/motion-engineer.md`](agents/motion-engineer.md)
   - Browser QA -> [`agents/browser-qa.md`](agents/browser-qa.md)
   - Security Audit -> [`agents/security-auditor.md`](agents/security-auditor.md)
   - Release Audit -> [`agents/production-reviewer.md`](agents/production-reviewer.md)
</details>

<details>
<summary><b>Using with Cursor IDE</b></summary>

### Overview
Cursor reads [`.cursorrules`](.cursorrules) and [`mcp.json`](mcp.json) at project root, enforcing anti-slop visual laws, TDD Red-Green-Refactor discipline, and metric honesty.

### How to Run
1. Open the project folder in Cursor: `cursor .`
2. Configure MCP servers:
   - Go to **Cursor Settings** -> **Features** -> **MCP Servers**.
   - Ensure `mcp.json` is loaded (Playwright and Google Stitch servers).
3. In Cursor Composer / Agent Chat:
   - Reference `@AGENTS.md` to establish multi-agent roles.
   - Reference `@agents/requirement-grilling.md` for requirement interrogation.
   - Reference `@agents/design-art-director.md` and `@skills/design/taste-skill.md` when styling components.
   - Reference `@agents/tdd-test-engineer.md` before generating component code.
4. Run gate checks in Cursor terminal:
   ```bash
   website-engineering-harness gates
   ```
</details>

<details>
<summary><b>Using with Windsurf IDE</b></summary>

### Overview
Windsurf reads [`.windsurfrules`](.windsurfrules) and uses Cascade workflows to navigate agent specifications.

### How to Run
1. Open the folder in Windsurf: `windsurf .`
2. In Cascade Chat:
   - Instruct Cascade: *"You are governed by AGENTS.md. Act as Master Website Orchestrator."*
   - Trigger stages: *"Read workflows/new-website.md and execute Stage 1 through Stage 4."*
3. Cascade can run terminal commands directly:
   ```bash
   website-engineering-harness validate
   website-engineering-harness gates
   ```
</details>

<details>
<summary><b>Using with Terminal / Any AI Agent (Aider, OpenCode, Cline, Terminal)</b></summary>

### Overview
Any AI coding tool or developer can operate the harness purely via standardized Markdown prompt injection and CLI scripts.

### How to Run
1. Provide `AGENTS.md` as system instructions:
   ```bash
   # In Aider:
   aider --read AGENTS.md
   ```
2. Execute tasks using the universal binary commands:
   ```bash
   # Initialize project
   website-engineering-harness init

   # Run automated test suites
   npm test

   # Run 6-viewport browser QA
   website-engineering-harness test:browser

   # Check compliance with G1-G13 Quality Gates
   website-engineering-harness gates

   # Full validation
   website-engineering-harness validate
   ```
</details>

---

## ⚡ Quick Start Reference (CLI & NPM)

```bash
# Check environment and audit harness
website-engineering-harness audit

# Validate all agents, skills, and MCP configurations
website-engineering-harness validate

# Run automated unit/integration tests
npm test

# Run real browser tests across 6 viewports
website-engineering-harness test:browser

# Check all 13 Quality Gates
website-engineering-harness gates

# Display CLI help menu
website-engineering-harness --help
```
