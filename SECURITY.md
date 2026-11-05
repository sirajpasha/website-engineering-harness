# Security policy

## Supported versions

Only the latest released version receives security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for a security problem. Use GitHub's private
reporting instead: **Security → Report a vulnerability** on
<https://github.com/sirajpasha/website-engineering-harness/security/advisories/new>.

Include the version, what you did, what you expected, and what happened. You can expect an
acknowledgement within a few days. Fixes are released as a patch version with a note in the
changelog; reporters are credited unless they ask not to be.

## What this tool does on your machine

You are installing something that can run commands, so here is exactly what it touches:

- **Hooks** (`scripts/hooks/claude-hook.js`) *read* a tool-call payload on stdin and decide
  allow/block. They never make network requests and never modify files.
- **The MCP server** (`scripts/mcp-server/server.js`) runs locally over stdio. Its tools read
  your project, run the project's own test command, and launch a **local** headless Chromium
  against a **local** static server bound to `127.0.0.1`. It reads and writes
  `reports/browser-qa/` and `.harness/` inside the project directory you point it at.
- **`install`** writes instruction/config files into the project you name and never overwrites
  an existing file without `--force`. It does not edit your global tool configuration.
- **Git hooks** are only installed when you run `install-hooks`.
- The only external network use is Playwright's browser download (done by you with
  `npx playwright install`) and the optional Stitch MCP, which you configure with your own key.

## Known limits

- The guards are a **safety net, not a sandbox**. The shell guard matches a short list of
  dangerous patterns; it can be bypassed by a determined or obfuscated command. Keep your AI
  tool's own permission prompts enabled.
- Quality gates verify the *form and evidence* of reports. A report whose numbers are false but
  well-formed will pass; gates backed by a measurement (G3, G7, G8, G9) are the strongest.
