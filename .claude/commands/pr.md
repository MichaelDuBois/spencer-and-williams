# Create Pull Request

Prepare and create a PR for the current branch.

## Pre-PR Validation

1. **Sync with main**
   ```bash
   git fetch origin main
   git rebase origin/main
   ```

2. **Run full validation**
   ```bash
   npm run test-all
   ```

3. **Review changes**
   ```bash
   git diff main --stat
   git log main..HEAD --oneline
   ```
   - All commits have clear messages
   - No debug code (`console.log`, `debugger`)
   - No sensitive data exposed

## PR Description

Use the PR template from `.github/PULL_REQUEST_TEMPLATE.md`. Fill in all sections:

1. **Description** — what the PR adds/removes/fixes/replaces
2. **Type** — check the applicable type(s)
3. **Related Tickets** — link Jira stories or GitHub issues
4. **Screenshots** — required for visual changes
5. **Documentation** — check if docs need updating
6. **Reviewers** — don't forget to assign

## Create PR

```bash
gh pr create --title "<type>: <description>" --body "<body following .github/PULL_REQUEST_TEMPLATE.md>"
```

Title format: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `test:`, `chore:` — under 72 chars, imperative mood.

## Output

Report readiness status and create PR if ready.
