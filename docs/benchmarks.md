# Benchmarks and acceptance scenarios

```bash
node scripts/website-engineering-harness-cli.js benchmark       # 24 representative specs
node scripts/website-engineering-harness-cli.js acceptance      # the 20 acceptance scenarios
```

Both also run inside `npm test` (`tests/benchmark-acceptance.test.js`), so CI covers them.

## Benchmark suite (`benchmarks/specs.json`)

24 specifications across corporate, e-commerce, SaaS, landing, portfolio, booking, customer-portal, full-stack, content, redesign, enhancement and an ambiguous brief. Each states the expected lifecycle mode, project sub-type and (where relevant) confidence.

**What it measures:** that every spec is classified as expected. **What it does not measure:** design quality, functional completeness, security, accessibility, performance, SEO, execution time, token consumption, defect rate, rework rate. Those need live end-to-end runs of the workflow, so the report lists them as `unmeasured`. No number is invented. When live runs are done, record their measured results; do not edit the offline report to look complete.

## Acceptance scenarios (`evals/acceptance-scenarios.json`)

| Kind | Meaning |
|---|---|
| automated | the stated behaviour is fully verified offline |
| partial | the mechanism is verified; a live end-to-end run is not |
| manual | needs a live or human run; not executed here |
| gap | required but not mechanically enforced |

Current status: 9 automated, 9 partial, 1 manual (#2 premium product website), 1 gap.

**Known gap (#20):** production-deployment approval is required by the commands and CLAUDE.md but no hook blocks a production deploy command, so it relies on the agent following instructions. Closing it means extending `scripts/hooks/pre-bash-gate.js`.

**Known limit (#17):** Claude Pro subscription usage cannot be read programmatically. The scenario verifies only the context/turn-budget circuit breaker.

The classifier benchmark found four misclassifications when first run (SaaS and portfolio wording, and a conference "schedule" read as booking). The rules were fixed, not the expectations.
