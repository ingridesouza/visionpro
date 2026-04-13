---
name: git-workflow
description: Core git workflow rules — NEVER commit to main, auto-commit after tasks, create branches by context, generate PRs on request. This skill is loaded automatically to enforce safe git practices.
user-invocable: false
disable-model-invocation: false
allowed-tools: Bash(git *)
---

## Git Workflow — VisionPro

**These rules MUST be followed at ALL times during development.**

### Rule 1: NEVER commit directly to `main`

- The `main` branch is **protected**. Never create commits on it.
- Before any work, check the current branch:
  ```bash
  git branch --show-current
  ```
- If on `main`, create a new branch BEFORE making any changes.

### Rule 2: Branch naming convention

Create branches using this pattern:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<short-description>` | `feat/add-dark-mode` |
| Bug fix | `fix/<short-description>` | `fix/websocket-reconnect` |
| Refactor | `refactor/<short-description>` | `refactor/split-frame-processor` |
| Docs | `docs/<short-description>` | `docs/api-reference` |
| Style/UI | `style/<short-description>` | `style/responsive-layout` |
| Tests | `test/<short-description>` | `test/add-libras-tests` |
| Chore/Config | `chore/<short-description>` | `chore/docker-setup` |
| Security | `security/<short-description>` | `security/add-rate-limiting` |

Rules:
- All lowercase, hyphens only (no spaces, underscores, or uppercase)
- Keep it short (2-4 words max)
- Branch name must reflect the **purpose** of the task

### Rule 3: Auto-commit after each task completion

After completing **each discrete task or subtask**:

1. Stage only the relevant files (never `git add .` or `git add -A`):
   ```bash
   git add <specific-files>
   ```

2. Write a **Conventional Commit** message:
   ```
   <type>(<scope>): <description>
   ```

   Types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `perf`, `security`
   Scope: `frontend`, `backend`, `api`, `ui`, `auth`, `ws`, `docker`, `ci`, etc.

   Examples:
   - `feat(backend): add token-bucket rate limiter`
   - `fix(frontend): prevent WebSocket reconnect on unmount`
   - `test(backend): add pytest suite for frame processor`
   - `style(ui): add responsive breakpoints for mobile`
   - `security(backend): add CORS hardening and security headers`

3. Commit message rules:
   - First line: max 72 characters, imperative mood ("add" not "added")
   - If the change needs explanation, add a blank line then a body
   - Never include `Co-Authored-By` unless the user asks for it
   - Never skip hooks (`--no-verify`)

4. Commit **frequently** — one commit per logical unit of work, not one giant commit at the end.

### Rule 4: Context-aware branching

Before starting work, analyze what the user is asking:

- **Multiple unrelated tasks?** → Create separate branches for each, commit, then come back to the user
- **Single feature with multiple steps?** → One branch, multiple commits (one per step)
- **Quick fix while on a feature branch?** → Stash, switch to a new `fix/` branch, commit the fix, switch back

Always check for uncommitted changes before switching branches:
```bash
git status --short
```

If there are uncommitted changes, stash them:
```bash
git stash push -m "WIP: <description>"
```

### Rule 5: PRs only when asked

- **NEVER** push to remote or create PRs unless the user explicitly asks
- When the user asks for a PR:
  1. Push the current branch: `git push -u origin <branch-name>`
  2. Create PR targeting `main` using `gh pr create`
  3. PR title follows the same Conventional Commit format
  4. PR body includes: Summary (bullet points), Test Plan, and files changed
- If multiple related branches exist, mention them in the PR description

### Rule 6: Keep it clean

- Before creating a PR, check for:
  - Unresolved merge conflicts
  - Debug `console.log` / `print()` statements
  - Commented-out code blocks
  - Files that shouldn't be committed (`.env`, `node_modules`, `__pycache__`)
- Run lint and tests before committing when feasible

### Decision flow

```
User gives a task
    │
    ├─ Am I on main? ──YES──→ Create branch → Work → Commit
    │                          (based on task type)
    ├─ Am I on a relevant branch? ──YES──→ Work → Commit
    │
    └─ Am I on an unrelated branch?
        ├─ Uncommitted changes? → Stash → Create new branch → Work → Commit
        └─ Clean? → Create new branch → Work → Commit
```
