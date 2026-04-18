---
name: security-scan
description: Run comprehensive security audit (OWASP checks, dependency vulnerabilities, code analysis)
user-invocable: true
allowed-tools: Bash(cd * && ruff check --select S *) Bash(cd * && npm audit *) Bash(cd * && pip audit *) Bash(cd * && pip install *) Bash(cd * && npx *) Bash(grep *) Bash(find *)
---

## Security Audit

Run a comprehensive security scan on the VisionPro project.

### 1. Backend Security (Ruff/Bandit rules)

```bash
cd backend
ruff check --select S .
```

Checks for: hardcoded passwords, SQL injection, command injection, unsafe deserialization, weak crypto, etc.

### 2. Frontend Dependency Audit

```bash
cd frontend
npm audit --omit=dev
```

### 3. Backend Dependency Audit

```bash
cd backend
pip audit
```

(Install with `pip install pip-audit` if not available)

### 4. Manual Checks

Scan the codebase for common vulnerabilities:

- **Secrets in code**: Search for hardcoded API keys, passwords, tokens in source files
  ```bash
  grep -rn "password\|secret\|api_key\|token" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.env*" backend/ frontend/src/
  ```

- **Unsafe eval/exec**: Check for `eval()`, `exec()`, `dangerouslySetInnerHTML`
- **CORS misconfiguration**: Verify `CORS_ORIGINS` is not `["*"]`
- **Missing input validation**: Check WebSocket handler validates all inputs
- **Rate limiting**: Verify rate limiter is active on WebSocket endpoint

### 5. OWASP Top 10 Checklist

Review the code against:
1. **A01 Broken Access Control** — Auth on WebSocket endpoint
2. **A02 Cryptographic Failures** — HMAC for token validation
3. **A03 Injection** — Pydantic validation on all inputs
4. **A04 Insecure Design** — Circuit breaker, rate limiting
5. **A05 Security Misconfiguration** — Security headers, CORS
6. **A06 Vulnerable Components** — Dependency audit
7. **A07 Auth Failures** — Token-based auth
8. **A08 Data Integrity** — Base64 validation
9. **A09 Logging Failures** — Structured logging
10. **A10 SSRF** — No outbound requests from user input

### Steps

1. Run all automated scans
2. Perform manual checks
3. Generate a security report with findings categorized by severity (Critical > High > Medium > Low)
4. Suggest remediation for each finding
