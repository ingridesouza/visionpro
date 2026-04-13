---
name: cleanup
description: Clean up the repo — remove merged branches, prune remotes, find debug artifacts, check for stale code
user-invocable: true
argument-hint: "[branches|debug|stale|all]"
allowed-tools: Bash(git *) Bash(grep *) Bash(find *)
---

## Repository Cleanup

Clean up the VisionPro repository. Argument: `branches`, `debug`, `stale`, or `all` (default).

### 1. Clean merged branches (`branches`)

Find and delete local branches that have been merged to main:

```bash
git fetch origin --prune
git branch --merged main | grep -v "main" | grep -v "\*"
```

For each merged branch, ask the user before deleting:
```bash
git branch -d <branch-name>
```

Also show remote branches that no longer exist:
```bash
git remote prune origin --dry-run
```

### 2. Find debug artifacts (`debug`)

Scan for code that shouldn't be committed:

```bash
# console.log / debugger in frontend
grep -rn "console\.log\|console\.debug\|debugger" frontend/src/ --include="*.ts" --include="*.tsx" | grep -v "test\." | grep -v node_modules

# print() in backend (outside of tests)
grep -rn "print(" backend/ --include="*.py" | grep -v test | grep -v __pycache__

# TODO/FIXME/HACK comments
grep -rn "TODO\|FIXME\|HACK\|XXX" frontend/src/ backend/ --include="*.ts" --include="*.tsx" --include="*.py" | grep -v node_modules | grep -v __pycache__

# Hardcoded localhost URLs (should use env vars)
grep -rn "localhost" frontend/src/ --include="*.ts" --include="*.tsx" | grep -v config | grep -v test | grep -v node_modules
```

### 3. Find stale code (`stale`)

Look for potential dead code:

```bash
# Unused imports (frontend - TypeScript)
npx tsc --noEmit 2>&1 | grep "declared but"

# Unused Python files
find backend/ -name "*.py" -not -name "__init__.py" -not -path "*/test*" -not -path "*/__pycache__/*" | while read f; do
  basename=$(basename "$f" .py)
  if ! grep -rq "$basename" backend/ --include="*.py" | grep -v "$f" > /dev/null 2>&1; then
    echo "Potentially unused: $f"
  fi
done

# Empty __init__.py that could be removed
find backend/ -name "__init__.py" -empty
```

### 4. Report

Generate a summary table:
| Category | Found | Action |
|----------|-------|--------|
| Merged branches | N | Delete? |
| Debug artifacts | N | Remove? |
| TODOs/FIXMEs | N | Review |
| Stale code | N | Review |

Ask the user before taking any destructive action.
