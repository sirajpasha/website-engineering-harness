# Installation

Prerequisites: Node.js **20.13+** (22 recommended), Git. Browser QA additionally needs Playwright in
*your project*: `npm i -D playwright axe-core && npx playwright install chromium`.

See the [README](../README.md#install) for the per-tool install commands (Claude Code plugin, Gemini
extension, Cursor / Windsurf / Copilot / Codex installer, generic MCP).

## Verify an install

```bash
# in your website project
npx -y github:sirajpasha/website-engineering-harness gate          # G1–G13 audit of this project
npx -y github:sirajpasha/website-engineering-harness test:browser  # real 6-viewport run
```

## Where things are written

| What | Where |
|---|---|
| Gate evidence documents | project root (`REQUIREMENTS.md`, `SECURITY_AUDIT_REPORT.md`, …) |
| Browser QA evidence | `reports/browser-qa/browser-qa.json` (+ screenshots) |
| Ratchet baselines, TDD receipts | `.harness/` |

Choose the project with `CLAUDE_PROJECT_DIR`, `HARNESS_PROJECT_DIR`, or by running from its directory
(`--target <dir>` on `gate`, `ratchet`, `test:browser`).
