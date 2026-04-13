---
name: deploy-check
description: Pre-deployment validation — runs all checks required before merging or deploying
user-invocable: true
allowed-tools: Bash(cd * && npm *) Bash(cd * && npx *) Bash(cd * && pytest *) Bash(cd * && python *) Bash(cd * && ruff *) Bash(cd * && pip *) Bash(cd * && git *) Bash(docker *)
---

## Pre-Deploy Validation

Run the complete validation pipeline before deploying or merging to main.

### Checklist

Run all checks in order. Stop on first failure.

#### 1. Git Status
```bash
git status --short
git log --oneline -5
```
Ensure working tree is clean and branch is up to date.

#### 2. Backend Lint
```bash
cd backend
ruff check .
ruff format --check .
```

#### 3. Backend Tests
```bash
cd backend
pytest --cov --cov-report=term-missing -q
```
Fail if coverage < 60%.

#### 4. Frontend Lint
```bash
cd frontend
npm run lint
```

#### 5. Frontend Type Check
```bash
cd frontend
npx tsc --noEmit
```

#### 6. Frontend Tests
```bash
cd frontend
npm run test
```

#### 7. Frontend Build
```bash
cd frontend
npm run build
```

#### 8. Security Scan
```bash
cd backend
ruff check --select S .
cd ../frontend
npm audit --omit=dev --audit-level=high
```

#### 9. Docker Build (optional)
```bash
docker compose build
```

### Steps

1. Run each check sequentially
2. Track pass/fail for each step
3. At the end, produce a summary table:
   | Check | Status |
   |-------|--------|
   | Git clean | PASS/FAIL |
   | Backend lint | PASS/FAIL |
   | Backend tests | PASS/FAIL |
   | Frontend lint | PASS/FAIL |
   | Frontend types | PASS/FAIL |
   | Frontend tests | PASS/FAIL |
   | Frontend build | PASS/FAIL |
   | Security scan | PASS/FAIL |

4. If all pass: "Ready to deploy"
5. If any fail: list the blockers with specific fix instructions
