# TROUBLESHOOTING GUIDE

## 1. Missing Dependencies or Runtimes
- **Symptom:** `node` or `git` reported missing during environment audit.
- **Resolution:** Verify system PATH environment variable in PowerShell or terminal.

## 2. MCP Server Connectivity Failures
- **Symptom:** `STITCH_API_KEY` missing or `@google/stitch-mcp` times out.
- **Resolution:** Verify `STITCH_API_KEY` is exported. The harness automatically supports local visual specification fallback if Stitch MCP is offline.

## 3. Playwright Browser Headless Execution
- **Symptom:** Playwright cannot find browser binaries.
- **Resolution:** Run `npx playwright install chromium`.

## 4. Quality Gate Blockers
- **Symptom:** Gate G10 fails due to high-severity security finding.
- **Resolution:** Review `SECURITY_AUDIT_REPORT.md`, implement required remediation, and re-run `node scripts/quality-gates/check-gates.js`.
