# Security Policy

## Reporting a Vulnerability

We take the security of Asset Studio seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email security concerns to: [your-email@example.com]

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity (critical issues prioritized)

## Security Measures

Asset Studio implements the following security controls:

### 1. **File Upload Security**
- ✅ Magic byte validation (prevents MIME spoofing)
- ✅ File size limits (50MB max)
- ✅ Blocked dangerous file types (SVG, HTML, XML, JS)
- ✅ Filename sanitization (prevents path traversal)
- ✅ Client-side and server-side validation

### 2. **API Security**
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ Abuse tracking (blocks IPs with >50 violations/hour)
- ✅ Input validation and sanitization
- ✅ Secure error handling (no stack traces exposed)
- ✅ API key stored server-side only
- ✅ HTTPS enforcement (production)

### 3. **Environment Variables**
- ✅ No `NEXT_PUBLIC_` prefix on secrets
- ✅ `.env` files excluded from version control
- ✅ Server-side only access to sensitive data
- ✅ Trust proxy configuration for accurate IP detection

### 4. **Security Headers**
- ✅ Content Security Policy (CSP) with upgrade-insecure-requests
- ✅ X-Frame-Options (clickjacking prevention)
- ✅ X-Content-Type-Options (MIME sniffing prevention)
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ✅ **Strict-Transport-Security (HSTS) with preload** (production)
- ✅ **Cross-Origin-Embedder-Policy (COEP)** (Spectre protection)
- ✅ **Cross-Origin-Opener-Policy (COOP)** (Spectre protection)
- ✅ **Cross-Origin-Resource-Policy (CORP)** (Spectre protection)

### 5. **Client-Side Security**
- ✅ All image processing in browser (except background removal)
- ✅ No sensitive data in client bundle
- ✅ XSS prevention via React's built-in escaping

### 6. **Dependency Management**
- ✅ Regular `npm audit` checks
- ✅ Minimal dependencies
- ✅ Lockfile committed to repository

## Known Limitations

### 1. **Rate Limiting**
- In-memory rate limiting resets on server restart
- For production scalability, consider Redis-based rate limiting (Upstash/Vercel KV)
- Abuse tracking also in-memory (consider persistent storage for high-traffic)

### 2. **CSRF Protection**
- Next.js API routes use SameSite cookies by default
- Server Actions compare Origin vs Host headers
- For custom route handlers, consider implementing CSRF tokens if needed

### 3. **File Storage**
- Files are processed in-memory only
- No persistent storage of user uploads
- Images sent to remove.bg are discarded after processing

## Security Best Practices for Deployment

### Production Checklist

- [ ] Set `REMOVEBG_API_KEY` in environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Configure `TRUSTED_PROXIES` if behind CDN/load balancer
- [ ] Enable HTTPS (required)
- [ ] Verify HSTS header in production
- [ ] Validate security headers (securityheaders.com)
- [ ] Configure proper CORS if needed
- [ ] Set up monitoring and logging
- [ ] Consider persistent rate limiting (Redis) for scale
- [ ] Regular dependency updates
- [ ] Follow [DEPLOYMENT_SECURITY.md](DEPLOYMENT_SECURITY.md) guide

### Vercel Deployment

Vercel automatically provides:
- ✅ HTTPS/TLS
- ✅ DDoS protection
- ✅ Edge caching
- ✅ Secure environment variables

Additional steps:
1. Add `REMOVEBG_API_KEY` to Vercel environment variables
2. Verify security headers in production
3. Monitor function logs for suspicious activity

## OWASP Top 10 Compliance

Asset Studio addresses the OWASP Top 10:2025:

| Risk | Mitigation |
|------|------------|
| A01: Broken Access Control | API key server-side only, rate limiting |
| A02: Security Misconfiguration | Security headers, no exposed secrets |
| A03: Software Supply Chain | Minimal deps, npm audit, lockfile |
| A04: Cryptographic Failures | HTTPS enforcement, secure API transmission |
| A05: Injection | Input validation, React XSS protection |
| A06: Insecure Design | Secure file validation, defense in depth |
| A07: Authentication Failures | N/A (no user authentication) |
| A08: Data Integrity Failures | Magic byte validation, file integrity checks |
| A09: Logging Failures | Server-side error logging |
| A10: Exception Handling | Generic error messages, no stack traces |

## Security Audit History

- **2026-02-10**: Initial security audit and hardening
  - Implemented magic byte validation
  - Added rate limiting
  - Configured security headers
  - Blocked dangerous file types

## Contact

For security-related questions or concerns:
- Email: [your-email@example.com]
- GitHub: [your-repo/security/advisories]

---

**Last Updated**: 2026-02-10
