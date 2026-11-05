# CHANGELOG

## [Unreleased]
### Fixed
- `npm run ci:local` restores the sample's tracked `browser-qa.json` after the run, so a local CI run no longer dirties the working tree. The file stays tracked: gates, ratchets and evals read it as fixture evidence (untracking it breaks 6 tests and 10 evals on a fresh clone).

## [2.2.1] - 2026-11-06
### Fixed
- **CLI banner** printed a hard-coded `v2.0.0`; it now reads the real package version (guarded by a test that also keeps `VERSION`, `package.json`, the marketplace, the Gemini extension and `AGENTS.md` in sync).
- **`AGENTS.md`** version was stale.
### Documentation (revalidated against the code)
- `docs/integration-guide.md`: removed the misleading Stitch key steps (Stitch is optional, see `integrations/`), documented the Playwright-in-your-project requirement, the MCP server entry and `walkthrough`.
- `docs/installation.md`: opt-in ratchets and walkthrough commands, output location.
- `docs/troubleshooting.md`: walkthrough (ffmpeg, NOT READY, Git Bash paths) and ratchet entries.
- `docs/agent-mapping.md`: Stitch is MCP/SDK, not a CLI. `docs/skill-governance.md`: Node 20.13+. `CLAUDE.md`: eval count 37.
- README version badge.
### Added
- `npm run ci:local` runs every `run:` step of `.github/workflows/ci.yml` locally, in order, so CI is exercised before pushing (cannot drift from the workflow; `--list` prints the steps).

## [2.2.0] - 2026-11-05
### Added
- **Client walkthrough videos**: `walkthrough` CLI command, `/website-walkthrough` slash command and `harness_walkthrough` MCP tool record desktop and phone videos of the real build (Playwright), with captions, poster stills, `walkthrough.json` and an unsigned `CLIENT_APPROVAL.md` quoting fresh measured QA evidence. Fails closed; a page that does not load makes the result NOT READY; MP4 is produced when ffmpeg is available.
### Fixed (browser QA false positives, found while auditing a real site)
- Visually hidden skip links, cancelled prefetch requests and label-wrapped controls are no longer flagged as failures.
### Fixed (found by running the README's commands as a new user)
- `gate` no longer fails a project just because ratchet baselines do not exist yet: ratchets are opt-in and are reported as "not configured". Once baselines exist, a regression or an unmeasurable metric still fails.
- Shell guard: `rm -rf <specific folder>` is no longer mistaken for a root delete, and `rm -fr /`, `~`, `$HOME`, `.` and `..` are now blocked.

## [2.1.1] - 2026-11-05
### Fixed (Stitch / MCP configuration)
- The npm packages `@google/stitch-mcp` and `@google/stitch-cli` named in earlier versions **do not exist** (404). They are removed from `mcp.json`, the Stitch agent, command, registry and docs, along with the invented `stitch_*` tool names.
- Stitch is now clearly **optional and not bundled**: `integrations/google-stitch-mcp.md` documents what was and was not verified and how to connect it with your own key at user scope; `integrations/google-stitch-sdk.md` replaces the nonexistent CLI page; `integrations/stitch.mcp.example.json` is a reference-only shape.
- Gate **G5** now requires `STITCH_DESIGN_SPEC.md` to declare `**Source:** Stitch MCP | Stitch SDK | Manual`, so a spec can never imply Stitch generated screens it did not. The sample site declares `Manual`.
- `mcp.json` pins `@playwright/mcp` to an exact version instead of `@latest`; `validate:mcp` treats Stitch as optional and understands HTTP servers.

## [2.1.0] - 2026-11-05
### Distribution (public release)
- **Claude Code plugin** (`plugin/`, generated; marketplace manifest in `.claude-plugin/`): 16 subagents, 14 slash commands, PreToolUse guard hook, MCP server.
- **Gemini CLI extension** (`gemini-extension.json`).
- **MCP server** (`scripts/mcp-server/`, stdio, zero dependencies): tools, one prompt per agent, standards/templates as resources. Works with any MCP client.
- **`install --tool cursor|claude|gemini|copilot|codex|windsurf|generic|all`**: writes project-level config, idempotent, never overwrites user files.
- Project-root awareness: gates, ratchets, browser QA, TDD receipts, hooks and git hooks now act on the *user's project* (`CLAUDE_PROJECT_DIR` / `HARNESS_PROJECT_DIR` / cwd), not the harness checkout.
- MIT `LICENSE`, `NOTICE.md` (attribution), `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue/PR templates, CI workflow.

### Changed (honesty fixes)
- Browser QA now runs real Playwright/Chromium at 6 viewports (overflow, 44px targets, axe-core, lab LCP/CLS). It previously printed PASS without launching a browser. It fails closed when Playwright is unavailable.
- Quality gates are content-aware (placeholders, open P0/High findings, stale/missing browser evidence, requirement→test traceability, motion durations, banned gradients) and never take evidence from `templates/` or `examples/`.
- Ratchets measure coverage, bundle size, viewports, vitals and axe violations; unmeasured metrics fail instead of defaulting.
- `validate` exits non-zero on failure; agents/plugin drift is checked in CI.
- Removed the self-certified `docs/acceptance-report.md` and the internal build prompt.
- Sample website: fixed a module-script bug, touch-target sizes, and a real WCAG colour-contrast failure found by axe.

## [2.0.0] - 2026-11-04
### Added
- Complete Universal Website Engineering Harness architecture.
- Universal cross-model support for Claude Code CLI, Gemini CLI / Antigravity, OpenAI Codex / Copilot, Cursor, Windsurf.
- 16 specialized agents in `agents/` and `.claude/agents/`.
- Summaries inspired by Taste Skill (`Leonxlnx/taste-skill`) for anti-slop visual art direction.
- Summaries inspired by Impeccable (`pbakaus/impeccable`) 24-command design vocabulary.
- Motion engineering guidance inspired by Emil Kowalski.
- Security and web-performance auditor roles inspired by Addy Osmani's guidance.
- Requirement-grilling, domain-modeling and TDD roles inspired by Matt Pocock's skills.
- Google Stitch MCP and Playwright MCP / CLI configurations.
- 14 workflow commands and 8 end-to-end execution workflows.
- 13 mandatory Quality Gates (G1 to G13) and traceability verification engine.
- Executable validation test suite in `scripts/`.
- Complete documentation suite and reference sample website.
