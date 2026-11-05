# Website Engineering Harness

**Give any AI coding agent a website team — and make it prove its work.**

[![CI](https://github.com/sirajpasha/website-engineering-harness/actions/workflows/ci.yml/badge.svg)](https://github.com/sirajpasha/website-engineering-harness/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.0-informational.svg)](VERSION)

AI assistants can write a landing page in a minute, and it usually looks like every other
landing page — and "it works on mobile" is a claim, not a result. This harness adds two things:

1. **A team.** 16 specialist roles (requirements interrogator, art director, UX critic, motion
   engineer, TDD engineer, browser QA, security, performance, accessibility, reviewers, release
   gatekeeper) that the AI loads one stage at a time, with design rules that reject generic
   template looks and unmotivated gradients.
2. **Evidence.** Thirteen quality gates backed by *measurement*: a real headless-Chromium run at six
   viewports (overflow, tap targets, axe accessibility, lab LCP/CLS), content-aware checks of the
   project's reports, monotonic quality ratchets, and guard hooks that block secrets, AI-slop
   gradients and out-of-role file writes **before** they happen. A check that cannot measure
   something says *unmeasured* and fails — it never prints PASS on faith.

Works with **Claude Code, Gemini CLI, Cursor, Windsurf, GitHub Copilot, Codex, and any tool that
speaks MCP or reads `AGENTS.md`.**

---

## Install

Pick your AI tool. Everything acts on the project you are working in.

### Claude Code (plugin — full experience)
```
/plugin marketplace add sirajpasha/website-engineering-harness
/plugin install website-engineering-harness@website-engineering-harness
```
You get 16 subagents, 14 slash commands (`/website-grill`, `/website-design`, `/website-test`, …),
the guard hook, and the MCP tools. (Always-on context cost is about 2.3k tokens.)

### Gemini CLI (extension)
```bash
gemini extensions install https://github.com/sirajpasha/website-engineering-harness
```

### Cursor · Windsurf · GitHub Copilot · Codex · anything else
```bash
cd my-website
npx -y github:sirajpasha/website-engineering-harness install --tool cursor     # or windsurf | copilot | codex | gemini | claude | generic | all
```
This writes only project-level files — instructions in each tool's native format
(`.cursor/rules/*.mdc`, `.windsurfrules`, `.github/copilot-instructions.md`, `AGENTS.md`,
`GEMINI.md`, `CLAUDE.md`) and, where the tool supports project-level MCP config
(`.cursor/mcp.json`, `.vscode/mcp.json`, `.gemini/settings.json`, `.mcp.json`), the MCP server entry.
Windsurf and Codex keep MCP config in your home directory, so the installer **prints** the snippet
instead of editing it. Re-running is safe; your own content and other MCP servers are preserved
(see [`SECURITY.md`](SECURITY.md) for exactly what it touches).

### Any MCP client
Register a stdio server:
```json
{ "command": "npx", "args": ["-y", "github:sirajpasha/website-engineering-harness", "mcp"] }
```

### Browser QA needs Playwright in your project
```bash
npm i -D playwright axe-core && npx playwright install chromium
```
Without it the browser tools report **blocked** (and the gate fails) — they do not pretend.

---

## Use it

Start a session and say what you want. For example, in Claude Code:

> `/website-grill` — I want a portfolio site for an architecture studio.

The orchestrator picks a mode (`NEW_WEBSITE`, `REDESIGN`, `ENHANCE`) and walks the stages:

```
grill → discover → art direction → UX critique → architecture → TDD build → motion
      → browser QA → security → performance → accessibility + SEO → release
```

After each stage it calls `harness_check_gates`. Each stage writes an artifact in your project root
(`REQUIREMENTS.md`, `DESIGN_DIRECTION.md`, `UI_CRITIQUE_REPORT.md`, …) — see
[`examples/sample-website`](examples/sample-website) for a complete reference project.

### The tools your AI gets (MCP) — and the CLI equivalents

| MCP tool | CLI | What it does |
|---|---|---|
| `harness_browser_qa` | `test:browser [file\|url]` | Headless Chromium at **360×800, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080**: horizontal overflow, ≥44px tap targets on touch sizes, one `<h1>`, `<main>`, console errors, axe WCAG 2.0/2.1/2.2 A/AA, lab LCP/CLS; screenshots + `reports/browser-qa/browser-qa.json` |
| `harness_check_gates` | `gate` | Verify G1–G13 from the project's evidence |
| `harness_check_ratchets` | `ratchet [--update]` | Measure coverage, JS/CSS size, viewports, LCP/CLS, axe violations; may only hold or improve |
| `harness_inspect_write` | — | Dry-run a write: secrets, banned AI gradients, agent write-roots |
| `harness_inspect_command` | — | Dry-run a shell command for destructive patterns |
| `harness_list_agents` | — | The 16 specialists and what each may write / spawn |

Every agent is also an MCP **prompt**, and the standards, templates and workflows are MCP **resources**.
CLI: `npx -y github:sirajpasha/website-engineering-harness <command>` (or the installed
`website-engineering-harness` binary); run it with no arguments for the full list.

---

## The 13 gates — and how each is actually checked

| Gate | Passes when | Check |
|---|---|---|
| G1 Requirements | `REQUIREMENTS.md` defines `REQ-###` ids, no placeholders | document |
| G2 Product | `USER_JOURNEYS.md` describes journeys | document |
| G3 Design direction | `DESIGN_DIRECTION.md` present **and no banned AI gradients in the source** | document + **source scan** |
| G4 UX critique | score `N/40` recorded, **0 open P0** | document |
| G5 Stitch | `STITCH_DESIGN_SPEC.md` present | document |
| G6 Architecture | `ARCHITECTURE.md` present | document |
| G7 TDD | every `REQ` has a row marked PASSED that **points to a test file that exists** | document + **file check** |
| G8 Motion | CSS has `prefers-reduced-motion` and **no animation/transition over 300ms** | document + **source scan** |
| G9 Browser QA | **fresh** Playwright report: 6/6 viewports, no overflow, axe clean — stale if sources changed | **measured** |
| G10 Security | Critical = 0, High = 0, STRIDE present | document |
| G11 Performance | LCP/INP/CLS each labelled `[STATIC OBSERVATION]`, `[LAB MEASURED]` or `[FIELD DATA]` | document (honesty) |
| G12 A11y & SEO | both reports present, no failed/unchecked items | document |
| G13 Release | **all earlier gates pass**, checklist fully ticked, sign-off recorded | derived |

Be clear-eyed: gates marked *document* verify that the evidence exists, is complete, contains no
placeholders and has no open blockers — they cannot prove a report's numbers are true. The gates
backed by a measurement (G3, G7, G8, G9) and the ratchets are the strongest; the
[`SECURITY.md`](SECURITY.md) and "Known limits" section say more.

### Guard hooks (Claude Code plugin)
On every tool call the hook checks the *proposed* action and blocks it (exit 2):
destructive shell commands (hard reset, force push, `--no-verify`, `rm -rf /`), secrets in written
content, the stock AI gradients, an agent writing outside its contract (`agents/*.contract.json`),
weakening or deleting tests during a recorded RED phase, and an agent spawning anything not in its
`may_spawn` list. These are a safety net, **not a sandbox** — keep your tool's own permission prompts on.

### Ratchets and TDD receipts
`ratchet --update` seeds `<project>/.harness/baselines.json` from measured values and only ever
tightens them. `tdd:red <test>` records a SHA-256 receipt of a genuinely failing test; `tdd:verify`
checks the RED→GREEN lifecycle.

---

## How it fits together

```
agents/*.md  +  agents/*.contract.json  +  agents/claude-subagents.json     ← canonical sources
        │                                   (role text · write/spawn contract · description/tools)
        ├──► .claude/agents/*.md      generated subagents (frontmatter)       npm run agents:sync
        └──► plugin/                  generated Claude Code plugin            npm run build:plugin

scripts/lib/paths.js     HARNESS_ROOT (where the harness lives) vs projectRoot() (your site)
scripts/mcp-server/      stdio MCP server — the universal adapter
scripts/hooks/           guards (+ claude-hook.js adapter)
scripts/browser-validation · quality-gates · ratchets · tdd · install · plugin
standards/ templates/ workflows/ skills/ integrations/   guidance content
examples/sample-website/ a reference project that passes all gates
evals/                   scenario evals for the guards and gates
```
CI (`.github/workflows/ci.yml`) runs the unit tests, the scenario evals, validation (including
generated-file drift), a real browser run, the ratchets, and the gate audit.

## Develop

```bash
git clone https://github.com/sirajpasha/website-engineering-harness && cd website-engineering-harness
npm ci && npx playwright install chromium
npm test            # unit + integration
npm run evals       # scenario evals
npm run validate:all
```
See [`CONTRIBUTING.md`](CONTRIBUTING.md). Edit sources, never generated files.

## What is and is not verified

- **Tested in this repo:** the guards, gates, ratchets, browser QA (against a real Chromium), MCP
  protocol handling, the installer's file output, and the plugin build — and the Claude Code plugin
  passes `claude plugin validate` and loads with 16 agents, 14 commands, 1 hook and 1 MCP server.
- **Not exercised live here:** each third-party IDE (Cursor, Windsurf, Copilot, Codex, Gemini) loading
  the files the installer writes. They follow each tool's documented project-file conventions;
  report any mismatch as an issue.
- **Lab, not field:** LCP/CLS come from headless Chromium on localhost with no throttling. They catch
  regressions; they are not real-user Core Web Vitals, and the reports label them accordingly.
- **Optional integrations** such as Google Stitch need your own credentials; nothing here calls them
  without your key.

## License and attribution

Maintained by [InfoDatSystems](https://www.infodatsystems.com). MIT — see [`LICENSE`](LICENSE). Several roles are *inspired by* public projects (Taste Skill, Impeccable,
Emil Kowalski, Addy Osmani, Matt Pocock); they are original summaries, not copies, and this project is
not affiliated with them. See [`NOTICE.md`](NOTICE.md).
