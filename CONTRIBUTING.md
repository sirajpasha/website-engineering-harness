# Contributing

Thanks for helping. This project's whole point is **evidence over claims**, so contributions are
held to the same rule: show that it works.

## Setup

```bash
git clone https://github.com/sirajpasha/website-engineering-harness
cd website-engineering-harness
npm ci
npx playwright install chromium     # needed for the browser-QA tests
npm test                            # unit + integration (needs Chromium)
npm run evals                       # scenario evals for the guards and gates
npm run validate:all                # agents, contracts, subagents, skills, MCP, gates
npm run ci:local                    # the full GitHub Actions workflow, locally
```

Node 20+ (22 recommended).

## Ground rules

1. **Tests first.** New behaviour needs a failing test before the implementation (`tests/`).
   A new guard or gate rule also needs a scenario in `evals/`.
2. **Never fake a result.** A check that cannot measure something must say *unmeasured* and fail
   closed. No hard-coded metrics, no "PASS" printed without running the thing.
3. **Edit sources, not generated files.**
   - `.claude/agents/*.md` and `plugin/` are generated. Edit `agents/*.md`,
     `agents/*.contract.json`, `agents/claude-subagents.json`, then run
     `npm run agents:sync && npm run build:plugin`. CI fails on drift.
4. **Keep the tool-agnostic core tool-agnostic.** Anything under `scripts/` must work from a plain
   terminal; tool-specific glue lives in the adapters (`plugin/`, `scripts/mcp-server/`,
   `scripts/install/`).
5. **No secrets in fixtures.** The write guard rejects them. Use the `@@TOKEN@@` mechanism in
   `evals/` when a scenario needs one.
6. Be honest in docs: describe what is verified by a test or measurement and what is guidance.

## Pull requests

- One logical change per PR; describe the *why* and how you verified it.
- Run `npm run ci:local` (executes the whole GitHub Actions workflow locally) and make sure it passes before pushing.
- Update `docs/changelog.md` for user-visible changes.

By contributing you agree your contribution is licensed under the MIT License.
