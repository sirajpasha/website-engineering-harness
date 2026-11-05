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

## 3b. Walkthrough problems
- **Symptom:** `.mp4` missing. **Resolution:** install `ffmpeg` (`winget install Gyan.FFmpeg`, `brew install ffmpeg`, `sudo apt install ffmpeg`); the `.webm` is always written.
- **Symptom:** result is **NOT READY**. **Resolution:** a page did not load (HTTP outside 200-399 or redirected off-origin). Fix the page or drop it from `--pages`.
- **Symptom (Windows Git Bash):** `--pages /` becomes a Windows path. **Resolution:** handled automatically; or use `--pages "/,/about"` from PowerShell.

## 4. Quality Gate Blockers
- **Symptom:** Gate G10 fails due to high-severity security finding.
- **Resolution:** Review `SECURITY_AUDIT_REPORT.md`, implement required remediation, and re-run `node scripts/quality-gates/check-gates.js`.
- **Symptom:** ratchets show "failed" after `ratchet --update` was run once. **Resolution:** a metric regressed or can no longer be measured (e.g. tests removed). Fix it; ratchets are opt-in, so deleting `.harness/baselines.json` returns to "not configured".
