# CHANGELOG

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
