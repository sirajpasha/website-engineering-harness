# INTEGRATION VALIDATION PROTOCOL

## 1. Overview
This protocol outlines how the harness validates MCP server connectivity, CLI tooling availability, and authentication states without hallucinating success.

## 2. Validation Procedure
1. Execute `node scripts/mcp-validation/validate-mcp.js`.
2. Test Playwright MCP server package availability via `npx @playwright/mcp@latest --version` or dry-run.
3. Check `STITCH_API_KEY` presence in process environment:
   - If present: Run connectivity check.
   - If absent: Gracefully report `[NOT CONFIGURED: STITCH_API_KEY MISSING]`; mark Gate G5 to fallback to local visual specifications.
4. Report clear diagnostics in console and harness health reports.
