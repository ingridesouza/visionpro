---
name: lint
description: Run linting and format checks on frontend (ESLint + TypeScript) and backend (Ruff)
user-invocable: true
argument-hint: "[frontend|backend|all|fix]"
allowed-tools: Bash(cd * && npm run lint*) Bash(cd * && npx eslint *) Bash(cd * && npx tsc *) Bash(cd * && ruff *) Bash(cd * && pip install ruff) Bash(cd * && npm install)
---

## Lint & Format Check

Run code quality checks. Argument: `frontend`, `backend`, `all` (default), or `fix` (auto-fix all).

### Backend (Ruff)

```bash
cd backend
ruff check .
ruff format --check .
```

To auto-fix:
```bash
ruff check --fix .
ruff format .
```

Ruff rules include: pycodestyle, pyflakes, isort, bugbear, **bandit (security)**, pyupgrade, simplify.

### Frontend (ESLint + TypeScript)

```bash
cd frontend
npm run lint
npx tsc --noEmit
```

### Steps

1. If `$ARGUMENTS` is `fix`, run auto-fix mode for both backend and frontend
2. Otherwise, run check-only mode
3. Report all issues found, grouped by severity (error > warning > info)
4. For security-related Ruff findings (S-rules), highlight them prominently
5. Suggest specific fixes for each issue
