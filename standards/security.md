# ENGINEERING STANDARD: APPLICATION SECURITY

## Standards
1. **OWASP Top 10 Compliance:** Mitigate injection, broken auth, sensitive exposure, and security misconfigurations.
2. **Threat Modeling:** Maintain a documented STRIDE threat model in `SECURITY_AUDIT_REPORT.md`.
3. **Secrets Hygiene:** Zero credentials, keys, or passwords committed to source control.
4. **Security Headers:** Enforce strict CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.
5. **Zero Blocker Policy:** Zero unmitigated CRITICAL or HIGH findings permitted at release.
