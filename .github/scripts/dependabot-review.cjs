const fs = require('node:fs')
const path = require('node:path')

const STATUS_MARKER = '<!-- dependabot-review-status -->'
const REPORT_MARKER = '<!-- dependabot-review-report -->'

async function getEligiblePr(github, context) {
  const { data: permission } =
    await github.rest.repos.getCollaboratorPermissionLevel({
      ...context.repo,
      username: context.payload.comment.user.login,
    })
  if (!['admin', 'maintain', 'write'].includes(permission.permission)) {
    return { isAuthorized: false, reason: 'Only collaborators with write permission can request a review.' }
  }
  const { data: pr } = await github.rest.pulls.get({
    ...context.repo,
    pull_number: context.issue.number,
  })
  if (
    pr.state !== 'open' ||
    pr.user.login !== 'dependabot[bot]' ||
    pr.head.repo?.full_name !== `${context.repo.owner}/${context.repo.repo}`
  ) {
    return { isAuthorized: true, reason: 'Reviews require an open Dependabot PR from this repository.' }
  }
  return { isAuthorized: true, pr }
}

async function findComment(github, context, marker) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    ...context.repo,
    issue_number: context.issue.number,
    per_page: 100,
  })
  return comments.find(
    (comment) =>
      comment.user?.login === 'github-actions[bot]' &&
      comment.body?.startsWith(marker),
  )
}

async function upsertComment(github, context, marker, body) {
  const existing = await findComment(github, context, marker)
  const params = { ...context.repo, body: `${marker}\n${body}` }
  if (existing) {
    await github.rest.issues.updateComment({
      ...params,
      comment_id: existing.id,
    })
    return
  }
  await github.rest.issues.createComment({
    ...params,
    issue_number: context.issue.number,
  })
}

async function acknowledge({ github, context, core }) {
  const { isAuthorized, pr } = await getEligiblePr(github, context)
  if (!isAuthorized) return
  if (!pr) {
    await upsertComment(
      github,
      context,
      STATUS_MARKER,
      'The review did not run: `/review-dependabot` requires an open, same-repository Dependabot PR.',
    )
    return
  }
  core.setOutput('eligible', 'true')
  core.setOutput('head', pr.head.sha)
  try {
    await github.rest.reactions.createForIssueComment({
      ...context.repo,
      comment_id: context.payload.comment.id,
      content: 'eyes',
    })
  } catch {
    core.warning('Could not acknowledge the command; the review will continue.')
  }
  await upsertComment(
    github,
    context,
    STATUS_MARKER,
    `Review in progress for commit ${pr.head.sha}. A previous report, if present, remains unchanged until this run succeeds.`,
  )
}

async function collectContext({ github, context, core, env = process.env }) {
  const { pr, reason } = await getEligiblePr(github, context)
  if (!pr) throw new Error(`Review stopped: ${reason}`)

  const paginate = (method, args) =>
    github.paginate(method, { ...context.repo, per_page: 100, ...args })
  const [comments, reviews, reviewComments, checks, statuses, runs, branchRules] =
    await Promise.all([
      paginate(github.rest.issues.listComments, { issue_number: context.issue.number }),
      paginate(github.rest.pulls.listReviews, { pull_number: context.issue.number }),
      paginate(github.rest.pulls.listReviewComments, { pull_number: context.issue.number }),
      paginate(github.rest.checks.listForRef, { ref: pr.head.sha }),
      paginate(github.rest.repos.listCommitStatusesForRef, { ref: pr.head.sha }),
      paginate(github.rest.actions.listWorkflowRunsForRepo, { head_sha: pr.head.sha }),
      paginate(github.rest.repos.getBranchRules, { branch: pr.base.ref }),
    ])
  const previousReport = comments.find(
    (comment) =>
      comment.user?.login === 'github-actions[bot]' &&
      comment.body?.startsWith(REPORT_MARKER),
  ) ?? null
  fs.writeFileSync(
    path.join(env.RUNNER_TEMP, 'dependabot-context.json'),
    JSON.stringify({ pr, comments, reviews, reviewComments, checks, statuses, runs,
      branchRules, previousReport }, null, 2),
  )
  core.setOutput('eligible', 'true')
  core.setOutput('head', pr.head.sha)
  core.setOutput('base', pr.base.sha)
}

async function publish({ github, context, env }) {
  const { data: pr } = await github.rest.pulls.get({
    ...context.repo,
    pull_number: context.issue.number,
  })
  const runUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`
  const footer = `\n\n[Workflow run](${runUrl}) · Advisory report by Codex; no approval or merge performed.`
  const report = env.REVIEW_REPORT?.trim()
  let status
  if (pr.state !== 'open' || pr.head.sha !== env.REVIEW_HEAD) {
    status =
      'This PR changed or closed during review. The new report was withheld.'
  } else if (env.REVIEW_RESULT !== 'success' || !report) {
    status =
      'The automated review did not finish. Check the workflow run for errors, including missing credentials.'
  } else if (report.length > 20000) {
    status = 'The review report exceeded the publishing limit and was withheld.'
  } else {
    await upsertComment(
      github,
      context,
      REPORT_MARKER,
      `## Dependabot review\n\nReviewed commit: ${env.REVIEW_HEAD}\n\n${report}${footer}`,
    )
    status = `Review completed for commit ${env.REVIEW_HEAD}. See the reusable Dependabot review report on this PR.`
  }
  await upsertComment(
    github,
    context,
    STATUS_MARKER,
    `${status}\n\nPost a new \`/review-dependabot\` comment to rerun after updates or completed CI.${footer}`,
  )
}

module.exports = { acknowledge, collectContext, publish }
