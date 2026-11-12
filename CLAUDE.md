# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CLAUDE CODE — WEBSITE ENGINEERING HARNESS INSTRUCTIONS (CLAUDE.md)

You are operating within the **Universal Website Engineering, Design & Quality Harness**.
When invoked, you act as the **Master Website Engineering Orchestrator (AGENT 01)** unless a specialized sub-agent or command has been directly requested.

## Primary References
- **Universal Multi-Agent Specification:** [`AGENTS.md`](AGENTS.md)
- **Specialized Agents Directory:** [`agents/`](agents/)
- **Skills Registry:** [`skills/registry/SKILL_REGISTRY.md`](skills/registry/SKILL_REGISTRY.md)
- **Workflows:** [`workflows/`](workflows/)
- **Commands:** [`commands/`](commands/)
- **Quality Standards:** [`standards/`](standards/)
- **Runnable CLI:** `node scripts/website-engineering-harness-cli.js <command>`

---

## Operating Protocol for Claude Code

1. **Role Identification:** When a task begins, identify the project operating mode (`NEW_WEBSITE`, `REDESIGN`, or `ENHANCE`).
2. **Context Routing:** Do not load every skill simultaneously. Load only the specialized agent definition and skills needed for the active stage.
3. **Requirement Grilling First:** Never jump straight to coding if user requirements are ambiguous. Invoke `agents/requirement-grilling.md` and use the Socratic interrogation pattern (one high-leverage question at a time).
4. **Anti-Slop Design:** Enforce `agents/design-art-director.md` (Taste Skill) and `agents/ux-ui-designer.md` (Impeccable 24-commands). Reject generic boilerplate templates and unmotivated gradients.
5. **TDD Discipline:** Follow strict Red-Green-Refactor with `agents/tdd-test-engineer.md`. Confirm test failure before writing production code.
6. **Real Browser Execution:** Test routes and responsive viewports with Playwright CLI (`node scripts/browser-validation/validate-browser.js` or Playwright MCP). Viewport baseline:
   - Mobile: 360x800, 390x844
   - Tablet: 768x1024, 1024x768
   - Desktop: 1440x900, 1920x1080
7. **Quality Gate Auditing:** Verify gates G1 through G13 before declaring release readiness using `npm run gate` or `node scripts/quality-gates/check-gates.js`.
8. **Metric Honesty:** Never invent Core Web Vitals or test results. Report static code observations if lab data is unmeasured.

---

## Slash Commands Available in Claude Code
- `/website-init`: Initialize environment, audit configuration, and set up project scaffolding.
- `/website-grill`: Interrogate requirements, expose hidden assumptions, and generate `REQUIREMENTS.md`.
- `/website-discover`: Build user journeys, target personas, and IA sitemap.
- `/website-design`: Art direction review via Taste Skill.
- `/website-stitch`: Screen generation and design system token mapping via Google Stitch.
- `/website-build`: Frontend scaffolding and component implementation.
- `/website-tdd`: Red-Green-Refactor vertical slice implementation.
- `/website-motion`: Micro-interaction, gesture, and transition engineering via Emil Kowalski skills.
- `/website-test`: Real browser validation across the 6 standard viewports.
- `/website-security`: OWASP Top 10 + STRIDE security review via Addy Osmani auditor.
- `/website-performance`: Core Web Vitals and asset payload review via Addy Osmani web perf auditor.
- `/website-critique`: Impeccable 24-command heuristic critique.
- `/website-audit`: Full-suite quality audit across all dimensions.
- `/website-release`: Quality gate G13 audit and production readiness sign-off.

---

## Commands (Node ESM, no build step; only dev dependency is `playwright`)

```bash
npm test                                   # node --test over tests/ and examples/sample-website/tests/
node --test tests/harness.test.js          # run a single test file
node --test --test-name-pattern="<name>" tests/harness.test.js   # single test by name
npm run validate:all                       # agents + contracts + skills + MCP (CLI `validate`)
npm run validate:contracts                 # only agents/*.contract.json vs schema/agent-contract.schema.json
npm run gate [-- --target <project-dir>]   # content-aware G1–G13 (rules in scripts/quality-gates/gate-rules.js); default target examples/sample-website; evidence is never taken from templates/ or examples/ unless it is the target. G9 needs <project>/reports/browser-qa/browser-qa.json from `test:browser` and goes stale if sources change (`npm run gates` = --all)
npm run ratchet [-- --update --target <dir>]   # MEASURES coverage (node --test), JS/CSS size, and (from browser-qa.json) viewports/LCP/CLS/axe violations; baselines live in <target>/.harness/baselines.json (seeded from measurements on first --update, only ever tighten); unmeasured metric = failure
npm run tdd:red -- <test-file>             # (CLI: tdd:red) record RED receipt; then `npm run tdd:verify`
npm run ci:local                           # run the GitHub Actions CI workflow locally (all run: steps of ci.yml); do this before every push/PR
npm run install-hooks                      # install git pre-commit/pre-push hooks
npm run build:plugin / check:plugin          # regenerate / verify plugin/ (generated Claude Code plugin; never edit by hand). `claude plugin validate plugin` validates it
node scripts/website-engineering-harness-cli.js install --tool <cursor|claude|gemini|copilot|codex|windsurf|generic|all> [--dir p]   # per-tool installer (scripts/install/install.js; source text: integrations/harness-instructions.md)
node scripts/website-engineering-harness-cli.js mcp                     # MCP stdio server (scripts/mcp-server/server.js); stdout is protocol-only
npm run evals                              # 37 deterministic scenario evals: evals/hook-scenarios.json (claude-hook decisions) + evals/gate-scenarios.json (mutate a copy of the sample, assert exact failing gates). Fixtures never contain real-looking secrets: use @@PRIVATE_KEY@@ / @@AWS_KEY@@ tokens (the write guard blocks the fixture file otherwise)
npm run test:browser -- [file.html|url] [--project dir]  # (a URL run - e.g. a Next.js dev/preview server - binds its evidence to the project sources via --project, else HARNESS_PROJECT_DIR/CLAUDE_PROJECT_DIR/cwd, so gate G9 can detect stale evidence) REAL Playwright run at 6 viewports; fails closed if Playwright/Chromium missing (setup: npm i; npx playwright install chromium). Writes reports/browser-qa/browser-qa.json
npm run walkthrough -- [url|file] [--out d --devices desktop,phone --pages /,/about --label "X v1" --no-captions]   # records desktop+phone videos + unsigned CLIENT_APPROVAL.md (scripts/walkthrough/walkthrough.js); fails closed; a non-loading page = NOT READY; mp4 only if ffmpeg exists
node scripts/hooks/pre-write-gate.js --file <path> --agent <agent-name>   # dry-run the write guard (or set ACTIVE_AGENT)
```

## Architecture (big picture)

This repo is a **harness/spec repository**, not a website. The deliverable website lives in a *target* project; `examples/sample-website/` is a reference output containing every artifact the harness expects (REQUIREMENTS.md, TEST_TRACEABILITY_MATRIX.md, *_REPORT.md, DESIGN_TOKENS.json, `src/`, `tests/`).

- **Agents (`agents/`)**: each specialist has a prose definition `<name>.md`, a machine contract `<name>.contract.json` (`allowed_write_roots`, `forbidden_write_roots`, `may_spawn`; schema in `schema/`), and an entry in `claude-subagents.json` (description + tools). `.claude/agents/<name>.md` is GENERATED from these (frontmatter `name` = contract name = hook `agent_type`): edit the sources, run `npm run agents:sync`; `npm run validate:subagents` fails on drift. The hook also enforces `may_spawn` on Agent/Task calls. There are 16 agent files (incl. `motion-engineer`) even though some docs say 15. **Model routing** lives in one file, `agents/model-registry.json` (alias + exact id + approved fallback per model, agent->model, task-class->model, escalation); logic in `scripts/lib/model-registry.js`. `npm run agents:sync` writes `model:` into the generated frontmatter and `validate:subagents` checks the registry. Exact model ids must be verified against the installed Claude Code; an unavailable model falls back only along the registry's explicit chain.
- **Entry points are duplicated per tool**: `CLAUDE.md`, `GEMINI.md`, `AGENTS.md` (canonical spec), `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`. Slash commands exist as `commands/*.md` (canonical) and `.claude/commands/`, `.claude/agents/`. Keep these in sync when changing a command, agent, or gate.
- **CI**: `.github/workflows/ci.yml` runs npm ci, installs Chromium, then tests, evals, validate:all, test:browser, ratchet, gate (in that order). Commit `package-lock.json` (`npm ci` needs it).
- **Two roots** (`scripts/lib/paths.js`): `HARNESS_ROOT` (agents, contracts, standards) vs `projectRoot()` (the website: `HARNESS_PROJECT_DIR` > `CLAUDE_PROJECT_DIR` > cwd). Anything that writes, gates or hooks must use projectRoot; inside this repo they coincide. Plugin subagent names arrive namespaced (`plugin:agent`) and are un-prefixed before contract lookup.
- **Distribution**: `plugin/` (generated, committed), `.claude-plugin/marketplace.json`, `gemini-extension.json`, MCP server, installer. Public repo: keep NOTICE.md/SECURITY.md accurate; never add a hard-coded or unmeasured result.
- **Single CLI**: `scripts/website-engineering-harness-cli.js` dispatches to the scripts under `scripts/*/` (validation, quality-gates, ratchets, tdd, hooks, telemetry, browser-validation, ci). npm scripts are thin aliases to it.
- **Mechanical enforcement layer** (v6): `.claude/settings.json` wires `scripts/hooks/claude-hook.js` as a PreToolUse hook for Bash/Write/Edit/MultiEdit; it calls the three guards below, takes agent identity from the payload `agent_type` (main session and agents without a contract are unrestricted), blocks with exit 2. Guards: `scripts/hooks/pre-write-gate.js` (secret + anti-slop-gradient regexes + contract write-root check, agent identity via `--agent`/`ACTIVE_AGENT`), `test-write-lock.js` (blocks deleting/weakening assertions during RED), `pre-bash-gate.js` (blocks destructive git/shell). TDD receipts go to `.harness/receipts/` (SHA-256 of the failing run); ratchets compare measured metrics against `<project>/.harness/baselines.json` (values may only hold or improve; root `.harness/baselines.json` is legacy defaults); context telemetry logs to `.harness/telemetry/`.
- **Content layers**: `skills/<domain>/` + `skills/registry/SKILL_REGISTRY.md` (+ `policy.md`) define loadable skills; `workflows/` sequence stages; `standards/` hold acceptance criteria; `templates/` seed project artifacts; `mcp.json` declares MCP servers (validated by `validate:mcp`).
- **Traceability**: REQ-IDs flow REQUIREMENTS → ACCEPTANCE_CRITERIA → COMPONENT_INVENTORY → TEST_TRACEABILITY_MATRIX; `validate:trace` checks the matrix.
