# Optional integrations (adapters)

The harness works fully offline with no external service. Integrations are optional and detected, never assumed.

```bash
node scripts/website-engineering-harness-cli.js adapters          # table
node scripts/website-engineering-harness-cli.js adapters --json   # discovery + resolved fallbacks
```

| Adapter | Detected by | Credential (name only) | Fallback |
|---|---|---|---|
| stitch | MCP server whose name matches `stitch` | `STITCH_API_KEY` | local design workflow |
| figma | MCP server named like `figma` | `FIGMA_ACCESS_TOKEN` | local design workflow |
| playwright-mcp | MCP server named like `playwright` | none | playwright-cli |
| playwright-cli | `playwright` module installed | none | reported limitation (browser checks not executed) |
| semgrep | `semgrep` on PATH | none | none: reported as not run |
| zap | `zap.sh` / `zap-baseline.py` / `zap.bat` on PATH | none | none: reported as not run |
| lighthouse | `lighthouse` on PATH or module | none | Playwright lab vitals |
| github | `gh` on PATH or GitHub MCP server | none | none: reported as not run (plain `git` still works for local version control) |
| sentry | MCP server named like `sentry` | `SENTRY_AUTH_TOKEN` | none; paid, requires approval |

Rules: discovery is offline and read-only (MCP config is read for server **names** only); an adapter is reported `available` only when detected and its credential variables are set, and is never reported as live-verified; retries are capped at 3 with a per-attempt timeout; paid or production-affecting adapters require explicit approval; a missing adapter is reported honestly, never faked. Usage is appended to `.harness/telemetry/adapter-usage.jsonl` in your project.
