# TROUBLESHOOTING GUIDE

## 1. Missing Dependencies or Runtimes
- **Symptom:** `node` or `git` reported missing during environment audit.
- **Resolution:** Verify system PATH environment variable in PowerShell or terminal.

## 2. MCP Server Connectivity Failures
- **Symptom:** No Stitch server connected (`claude mcp list` does not show it).
- **Resolution:** Stitch is optional. To use it, follow `integrations/google-stitch-mcp.md` (your own API key, user-scope config). Without it the harness uses a hand-written spec labelled `**Source:** Manual`. Note: there is no `@google/stitch-mcp` npm package.

## 3. Playwright Browser Headless Execution
- **Symptom:** Playwright cannot find browser binaries.
- **Resolution:** Run `npx playwright install chromium`.

## 4. Quality Gate Blockers
- **Symptom:** Gate G10 fails due to high-severity security finding.
- **Resolution:** Review `SECURITY_AUDIT_REPORT.md`, implement required remediation, and re-run `node scripts/quality-gates/check-gates.js`.
