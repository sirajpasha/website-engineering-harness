# COMMAND: /website-discover

## Description
Activates AGENT 03 (Product Discovery Specialist) to transform grilled requirements into user personas, journey flows, IA sitemaps, and deterministic acceptance criteria.

## Invocations
- Claude Code: `/website-discover`
- Terminal / Node: `node scripts/website-engineering-harness-cli.js discover`

## Workflow Steps
1. Ingest `REQUIREMENTS.md`.
2. Construct primary and secondary user personas in `USER_PERSONAS.md`.
3. Map end-to-end user journeys from landing to key conversion actions in `USER_JOURNEYS.md`.
4. Define full route hierarchy and page metadata in `SITEMAP.md`.
5. Write Given/When/Then acceptance criteria for all `REQ-XXX` in `ACCEPTANCE_CRITERIA.md`.
6. Enforce Quality Gate G2 (Product Discovery).
