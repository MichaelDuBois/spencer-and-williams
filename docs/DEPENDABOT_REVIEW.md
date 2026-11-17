# Dependabot reviews

The shared review instructions live in `.agents/skills/review-dependabot/SKILL.md`.
Claude Code uses the wrapper in `.claude/skills/review-dependabot/SKILL.md`.

## GitHub setup

1. Add an OpenAI API key as the repository Actions secret `OPENAI_API_KEY`.
   Organization secrets must allow this repository. API usage is billed to that key.
   In GitHub, open **Settings → Secrets and variables → Actions → New repository
   secret**, set the name to `OPENAI_API_KEY`, and paste the key as the value.
   Create the key in your [OpenAI API project](https://platform.openai.com/api-keys).
2. Merge the skill and `.github/workflows/review-dependabot.yml` into the
   repository's default branch. Comment events use the workflow on that branch.
3. On an open Dependabot PR, post `/review-dependabot` as a new top-level
   comment. The command is case-insensitive but must have no leading or trailing
   whitespace or other text. The requester must have repository write, maintain,
   or admin permission.

The workflow uses Codex to post a report in the PR conversation. It does not run
automatically when a PR opens. It accepts same-repository Dependabot PRs only;
issue comments, other commands, and unauthorized requests do not invoke the reviewer.
Editing an existing comment does not trigger a run. Post a new command to rerun.

CI runs a production build for Dependabot PRs targeting `develop`. Wait for CI,
including **Build**, to finish before requesting a review so its evidence includes
the completed results for the current commit.

## Finding runs and troubleshooting

Open the repository's **Actions** tab, select **Review Dependabot**, and open the
run created after your command. Comment-triggered runs use the default branch and
may not appear in the Dependabot PR's checks list. If acknowledgement fails, there
may be no reaction or status comment; the Actions run still contains the error.

If posting a reaction or PR comment fails with `403 Resource not accessible by
integration`, check the failed job's **Set up job → GITHUB_TOKEN Permissions**.
The `acknowledge` and `publish` jobs request both `issues: write` and
`pull-requests: write` to write to PR conversations. The `review` job only needs
read permissions.

Merge workflow fixes into the default branch, then post a new `/review-dependabot`
comment. Rerunning the old run uses its original workflow revision.

If a report says web search is unavailable, the reviewer can fetch official
sources with HTTP commands instead. The workflow selects a `dependabot-review`
permission profile extending `:read-only`, with command networking enabled
through the Codex network proxy. Its trusted configuration in
`.github/codex/dependabot-review.toml` is copied to a temporary Codex home before
the action starts. Public destinations are allowed because upstream
documentation hosts vary by dependency; repository files remain read-only.
Fetched content is untrusted evidence and must never be executed. Hosted web
search and command networking are separate capabilities: `web_search="live"`
alone does not enable HTTP requests. If both methods fail, inspect the reported
access error in the run logs; a rerun without a configuration change may leave
the same evidence gap.

## Review behavior

The GitHub reviewer explicitly uses `gpt-6.1-sol` with `low` reasoning effort and
requests concise reports to reduce cost. Model selection belongs to the workflow,
not the API key; the API project must allow this model. Low effort and a word target
do not impose a hard token or spending cap. Local Codex and Claude model settings
are unaffected. Review complex upgrades manually when the automated review
leaves material uncertainty.

Eligible commands receive a 👀 reaction. One reusable status comment shows whether
the review is running, completed, skipped, or failed. The latest successful report
also has its own reusable comment: reruns update it instead of adding another report.
The reviewer compares the prior report and contributor replies, summarizing resolved,
still-open, disputed, and new findings. Each updated report remains self-contained.
Failed or stale reruns update the status without overwriting the previous report;
check its reviewed commit before relying on it.

The reviewer reads the pinned diff, repository code, upstream documentation,
CI check results, and active branch rules. It does not execute PR code or install
dependencies. Pending relevant checks or other material gaps can produce
`Insufficient evidence`; rerun after CI finishes. The branch rules evidence does
not include classic branch protection, so the reviewer should identify approval
or required-check rules it cannot verify. CI logs and local tests may require a
follow-up local review.
Publication happens in a separate job with comment-write permission. If the PR
head changes or closes, the report is withheld and the comment explains why.
Reviewer failures produce a comment linking the workflow run for diagnosis.

Reports are advisory: GitHub approvals, branch protections, and merging remain
separate. This workflow uses Codex; the shared skill also works locally in Claude
Code, but this workflow does not select or invoke Claude.

## Local use

- Codex: `$review-dependabot` followed by the PR number or URL.
- Claude Code: `/review-dependabot` followed by the PR number or URL.

Local reviews can perform additional verification in an isolated worktree as
described by the shared skill. Reports stay in the conversation unless publication
is explicitly requested.

The comment-handling tests run in CI and can be run locally with
`npx vitest run __tests__/github/scripts/dependabot-review.test.mjs`.

References: [Codex GitHub Action](https://learn.chatgpt.com/docs/github-action),
[permission profiles](https://learn.chatgpt.com/docs/permissions),
[web search](https://learn.chatgpt.com/docs/web-search),
[GitHub comment events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#issue_comment).
