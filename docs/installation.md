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

## Optional: ratchets and client video

```bash
npx -y github:sirajpasha/website-engineering-harness ratchet --update   # opt in to ratchets (seeds .harness/baselines.json)
npx -y github:sirajpasha/website-engineering-harness walkthrough http://localhost:3000 --label "Acme v1"
```
Until `ratchet --update` is run, `gate` reports ratchets as "not configured" and does not fail on them.

## Where things are written

| What | Where |
|---|---|
| Gate evidence documents | project root (`REQUIREMENTS.md`, `SECURITY_AUDIT_REPORT.md`, …) |
| Browser QA evidence | `reports/browser-qa/browser-qa.json` (+ screenshots) |
| Ratchet baselines, TDD receipts | `.harness/` |
| Client approval videos and sheet | `reports/walkthrough/` |

Choose the project with `CLAUDE_PROJECT_DIR`, `HARNESS_PROJECT_DIR`, or by running from its directory
(`--target <dir>` on `gate` and `ratchet`; `--project <dir>` on `test:browser` when you point it at a running URL such as a Next.js server).
