# SECURITY AUDITOR CHECKLIST & THREAT MODEL (skills/security/)

## 1. Overview
Adopting the authoritative standards of Addy Osmani's Security Auditor, this skill guides systematic threat modeling, vulnerability auditing, and security reviews.

## 2. Threat Modeling Framework (STRIDE)
- **Spoofing:** Can an attacker forge identity, spoof cookies, or impersonate API requests?
- **Tampering:** Can client-side parameters, hidden form fields, or local storage be manipulated maliciously?
- **Repudiation:** Are sensitive operations logged with tamper-evident audit trails?
- **Information Disclosure:** Are API endpoints leaking sensitive PII, server stack traces, or environment secrets?
- **Denial of Service:** Are public forms protected by rate-limiting or proof of work? Can large payloads overwhelm server memory?
- **Elevation of Privilege:** Can an authenticated basic user access admin endpoints via IDOR (BOLA)?

## 3. Essential Web Security Controls
- **Content Security Policy (CSP):**
  `default-src 'self'; script-src 'self' 'nonce-...'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'self';`
- **Security Headers:**
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Input Sanitization:** Validate all incoming data against strict schemas (e.g. Zod). Encode all untrusted dynamic inputs rendered in HTML contexts.
- **Dependency Scan:** Run `npm audit` and ensure 0 High/Critical CVEs.
