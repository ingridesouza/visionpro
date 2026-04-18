# VisionPro — Claude Code Guidelines

## Git Workflow (MANDATORY)

1. **NEVER commit to `main`**. Always create a branch first.
2. **Branch naming**: `<type>/<short-description>` (e.g., `feat/add-auth`, `fix/ws-timeout`)
   - Types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `security`, `perf`
3. **Commit after every completed task** — one logical change per commit.
4. **Conventional Commits**: `<type>(<scope>): <description>` (e.g., `feat(backend): add rate limiter`)
5. **Never push or create PRs** unless the user explicitly asks. Use `/pr` skill.
6. **Stage specific files** — never use `git add .` or `git add -A`.
7. If on `main` when starting work, create a branch first. If on an unrelated branch, stash and create a new one.

## Project Structure

- `frontend/` — React 19 + TypeScript + Vite (port 5173)
- `backend/` — Python FastAPI + DeepFace + MediaPipe (port 8000)
- Frontend talks to backend via WebSocket at `/ws/emotion`

## Code Standards

- **Backend**: Python 3.11+, type hints, Ruff for linting (config in `pyproject.toml`)
- **Frontend**: TypeScript strict mode, ESLint, Vitest for tests
- **Language**: UI strings in Portuguese (pt-BR) via `src/lib/i18n.ts`. Keep all user-facing text in the i18n system.
- **Security first**: validate inputs, never trust client data, use Pydantic schemas

## Before Committing

- Run `ruff check .` (backend) and `npm run lint` (frontend)
- Run `pytest -q` (backend) and `npm run test` (frontend) when touching tested code
- Remove `console.log`, `print()`, `debugger` statements
- Don't commit `.env`, `node_modules`, `__pycache__`, or model assets

## Skills Available

- `/dev` — Start dev servers
- `/test` — Run tests
- `/lint` — Lint check/fix
- `/build` — Production build check
- `/docker` — Docker compose operations
- `/security-scan` — Full security audit
- `/preview` — Open app in browser
- `/deploy-check` — Pre-deploy validation pipeline
- `/branch` — Create/list/switch branches
- `/pr` — Create pull request to main
- `/cleanup` — Remove merged branches, find debug artifacts
