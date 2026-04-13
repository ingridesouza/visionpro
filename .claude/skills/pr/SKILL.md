---
name: pr
description: Create a pull request from the current branch to main, with conventional commit title and structured body
user-invocable: true
argument-hint: "[title override]"
allowed-tools: Bash(git *) Bash(gh *)
---

## Create Pull Request

Create a PR from the current branch targeting `main`.

### Pre-flight checks

Before creating the PR, verify:

1. **Not on main**:
   ```bash
   git branch --show-current
   ```
   If on `main`, abort with error.

2. **All changes committed**:
   ```bash
   git status --short
   ```
   If there are uncommitted changes, commit them first following git-workflow rules.

3. **Tests pass** (quick check):
   ```bash
   cd frontend && npx tsc --noEmit 2>&1 | tail -3
   ```

4. **No debug artifacts**:
   ```bash
   grep -rn "console\.log\|debugger" frontend/src/ --include="*.ts" --include="*.tsx" | grep -v test | grep -v node_modules || true
   grep -rn "print(" backend/ --include="*.py" | grep -v test | grep -v __pycache__ || true
   ```

### Create the PR

1. Push the branch:
   ```bash
   git push -u origin $(git branch --show-current)
   ```

2. Analyze all commits on this branch (vs main):
   ```bash
   git log origin/main..HEAD --oneline
   git diff origin/main...HEAD --stat
   ```

3. Generate PR title:
   - If user provided `$ARGUMENTS`, use it
   - Otherwise, derive from branch name and commits
   - Format: Conventional Commit style (`feat(scope): description`)

4. Generate PR body with this template:
   ```markdown
   ## Summary
   - <bullet points describing changes>

   ## Changes
   - <list of modified files grouped by area>

   ## Test Plan
   - [ ] <checklist of things to verify>

   ## Related
   - Branch: `<branch-name>`
   - Commits: <count>
   ```

5. Create PR:
   ```bash
   gh pr create --title "<title>" --body "<body>" --base main
   ```

6. Report the PR URL back to the user.
