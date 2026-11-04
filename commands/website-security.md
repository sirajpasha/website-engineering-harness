# COMMAND: /website-security

## Description
Activates AGENT 12 (Security Auditor) based on Addy Osmani's Security Auditor standard to conduct threat modeling (STRIDE), OWASP Top 10 analysis, and secrets scanning.

## Invocations
- Claude Code: `/website-security`
- Terminal / Node: `npm run audit:security` or `node scripts/website-engineering-harness-cli.js security`

## Workflow Steps
1. Scan repository for hardcoded credentials, API keys, or private tokens.
2. Review client input validation, XSS escaping, and dangerous innerHTML injections.
3. Verify CSP headers, CORS policies, and secure cookie/storage settings.
4. Document all findings in `SECURITY_AUDIT_REPORT.md` using the standard finding schema.
5. If any CRITICAL or HIGH finding exists, block release until resolved.
6. Enforce Quality Gate G10 (Security Audit).
