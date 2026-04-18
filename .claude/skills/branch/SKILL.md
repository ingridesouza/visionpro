---
name: branch
description: Create a new branch from main with proper naming convention, or list/switch branches
user-invocable: true
argument-hint: "<type>/<name> | list | switch <branch>"
allowed-tools: Bash(git *)
---

## Branch Management

Manage git branches for VisionPro.

### Usage

- `/branch feat/add-dark-mode` — Create a new branch from latest main
- `/branch list` — Show all local and remote branches with status
- `/branch switch feat/add-dark-mode` — Switch to an existing branch (stash if needed)

### Create a new branch

1. Ensure working tree is clean (stash if needed):
   ```bash
   git status --short
   ```

2. Fetch latest and branch from `origin/main`:
   ```bash
   git fetch origin
   git checkout -b $ARGUMENTS origin/main
   ```

3. Confirm:
   ```bash
   git branch --show-current
   ```

### List branches

```bash
git branch -a --sort=-committerdate --format='%(refname:short) %(committerdate:relative) %(subject)'
```

### Switch branch

1. Check for uncommitted changes
2. If dirty, stash with descriptive message
3. Switch: `git checkout <branch>`
4. Report current state

### Naming convention

Enforce: `<type>/<short-description>` where type is one of:
`feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `security`, `perf`

Reject names that don't follow this pattern.
