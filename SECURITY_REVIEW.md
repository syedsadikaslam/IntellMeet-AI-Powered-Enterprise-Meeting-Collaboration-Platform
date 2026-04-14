# Security Review Checklist: IntellMeet

This document outlines the security measures implemented and recommendations for the production environment.

## Implemented Security Features
- [x] **Helmet.js**: Set security headers to prevent common attacks (XSS, Clickjacking).
- [x] **Rate Limiting**: Applied to `/api/auth/login` and `/api/auth/register`.
- [x] **Data Validation**: Using Zod on the frontend and schema validation on the backend.
- [x] **Auth Guarding**: Standardized JWT check middleware for protected routes.
- [x] **Environment Variable Validation**: Critical keys are checked at startup.

## OWASP ZAP Scanning Instructions
To perform a dynamic application security testing (DAST):
1. Install [OWASP ZAP](https://www.zaproxy.org/).
2. Start the local server using Docker Compose.
3. Use the "Automated Scan" tool in ZAP against `http://localhost:3000`.
4. Review the "Alerts" tab for vulnerabilities like SQL Injection, Cross-Site Scripting (XSS), etc.

## Recommended Hardening
- **SSL/TLS**: Ensure the application is served over HTTPS only (handled by Nginx/Vercel).
- **CORS**: Ensure `allowedOrigins` in `server/index.js` is strictly limited to production domains.
- **Dependency Audit**: Regularly run `npm audit` to check for vulnerable packages.
