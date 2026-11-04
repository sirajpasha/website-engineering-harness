# WORKFLOW: SECURITY REVIEW & THREAT MODELING

## 1. Overview
The Security Review workflow executes independent application security analysis following Addy Osmani's Security Auditor standard, OWASP Top 10, and STRIDE threat modeling.

## 2. Review Pipeline
1. **Secrets & Credentials Scan:** Regex search for committed private keys, JWTs, API tokens, passwords.
2. **Threat Modeling (STRIDE):** Map data flows, trust boundaries, and elevation vectors.
3. **OWASP Top 10 Check:** Audit XSS prevention, injection safety, authentication, and CSRF/CORS.
4. **Dependency Vulnerability Scan:** Run `npm audit` or equivalent dependency check.
5. **Report Compilation:** Record findings in `SECURITY_AUDIT_REPORT.md`.
6. **Gate Evaluation:** Zero CRITICAL or HIGH findings required to pass Gate G10.
