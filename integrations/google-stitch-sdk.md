# INTEGRATION: GOOGLE STITCH SDK (optional)

There is **no official Stitch CLI** on npm (`@google/stitch-cli` returns 404; older harness docs named it by
mistake). What does exist is the SDK, `@google/stitch-sdk`, a Node library for generating screens from prompts and
extracting their HTML and screenshots programmatically.

Use it only if you want scripted generation instead of an MCP connection:

```bash
npm i -D @google/stitch-sdk      # in YOUR project; needs your own Stitch API key in the environment
```

The SDK's API is not documented in this repository — read its README on npm / GitHub before writing code against it,
and do not invent method names. Whatever it returns is **untrusted input**: review before copying it into the codebase.

If you generate screens this way, record `**Source:** Stitch SDK` in `STITCH_DESIGN_SPEC.md` (Gate G5).
For the MCP route see [`google-stitch-mcp.md`](google-stitch-mcp.md).
