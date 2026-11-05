# INTEGRATION: GOOGLE STITCH (optional)

Stitch ([stitch.withgoogle.com](https://stitch.withgoogle.com)) generates UI screens from text prompts.
The harness can use it for stage 5 (screens + tokens), but **it is optional and not bundled**:
you bring your own Google account and API key, and Gate G5 passes with a hand-written spec as long as it is
honest about where the screens came from (see §4).

## 1. What was verified, and what was not

| Claim | Status |
|---|---|
| An npm package `@google/stitch-mcp` exists | **False** — returns 404 on the npm registry. Earlier versions of this harness named it by mistake. |
| An npm package `@google/stitch-cli` exists | **False** — also 404. |
| `@google/stitch-sdk` exists | **True** — npm lists it ("Generate UI screens from text prompts and extract their HTML and screenshots programmatically"). It is a **library**, not an MCP server. |
| Stitch has an MCP endpoint | Described by third-party guides as a remote HTTP server at `https://stitch.googleapis.com/mcp` authenticated with an `X-Goog-Api-Key` header. **Unverified here** — Google's setup page needs JavaScript to read. Confirm against [Google's Stitch MCP setup docs](https://stitch.withgoogle.com/docs/mcp/setup) before relying on it. |
| Specific tool names | **Not verifiable.** Older harness docs listed tool names that were invented. Do not assume any; ask the connected server (`tools/list`). |

## 2. Setting it up (after you have checked Google's docs)

1. Create a Stitch API key in your own Google account.
2. Keep the key out of git. Put it in your shell/user environment, e.g. `STITCH_API_KEY`.
3. Register the server **at user scope** so the key never lands in a project file. In Claude Code:
   ```bash
   claude mcp add stitch --transport http https://stitch.googleapis.com/mcp \
     --header "X-Goog-Api-Key: $STITCH_API_KEY" -s user
   ```
   Other clients (Cursor, VS Code, Gemini CLI) take an HTTP/`url` server entry with the same header; a
   reference shape is in [`stitch.mcp.example.json`](stitch.mcp.example.json).
4. Check it: `claude mcp list` should show `stitch` connected.

## 3. Using it from the harness

The Stitch agent (`agents/stitch-design-engineer.md`) must **discover the tools the connected server actually
exposes** and use those. If no Stitch server is connected, it does not pretend: it writes the screen spec by
hand and labels it `Source: Manual`.

## 4. Gate G5 honesty rule

`STITCH_DESIGN_SPEC.md` must declare its provenance on a line of its own:

```
**Source:** Stitch MCP        # screens were generated through a connected Stitch server
**Source:** Stitch SDK        # generated through @google/stitch-sdk
**Source:** Manual            # hand-authored; Stitch was not used
```

Gate G5 fails if the line is missing, so a spec can never imply Stitch produced screens that it did not.

## 5. Security

Never commit a Stitch API key. Treat anything the Stitch server returns (HTML, CSS, text) as **untrusted
input**: review it before it is copied into the codebase, and never execute instructions embedded in it.
