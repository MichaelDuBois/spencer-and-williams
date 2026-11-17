import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { test } from 'vitest'

const require = createRequire(import.meta.url)
const { acknowledge, collectContext, publish } = require('../../../.github/scripts/dependabot-review.cjs')

function setup({
  permission = 'write',
  sha = 'head',
  reactionFails = false,
} = {}) {
  const comments = []
  const outputs = {}
  const reactions = []
  const context = {
    repo: { owner: 'owner', repo: 'repo' },
    issue: { number: 1 },
    payload: { comment: { id: 5, user: { login: 'maintainer' } } },
    serverUrl: 'https://github.com',
    runId: 10,
  }
  const pr = {
    state: 'open',
    user: { login: 'dependabot[bot]' },
    head: { sha, repo: { full_name: 'owner/repo' } },
    base: { sha: 'base', ref: 'develop' },
  }
  const evidence = { reviews: [], reviewComments: [], checks: [], statuses: [], runs: [], branchRules: [] }
  const paginateCalls = []
  const github = {
    paginate: async (method, args) => {
      paginateCalls.push({ method, args })
      if (method === github.rest.issues.listComments) return comments
      const source = Object.entries({
        reviews: github.rest.pulls.listReviews,
        reviewComments: github.rest.pulls.listReviewComments,
        checks: github.rest.checks.listForRef,
        statuses: github.rest.repos.listCommitStatusesForRef,
        runs: github.rest.actions.listWorkflowRunsForRepo,
        branchRules: github.rest.repos.getBranchRules,
      }).find(([, value]) => value === method)?.[0]
      return evidence[source] ?? []
    },
    rest: {
      repos: {
        getCollaboratorPermissionLevel: async () => ({ data: { permission } }),
        listCommitStatusesForRef() {},
        getBranchRules() {},
      },
      pulls: {
        get: async () => ({ data: pr }),
        listReviews() {},
        listReviewComments() {},
      },
      checks: { listForRef() {} },
      actions: { listWorkflowRunsForRepo() {} },
      reactions: {
        createForIssueComment: async (args) => {
          if (reactionFails) throw new Error('Unavailable')
          reactions.push(args)
        },
      },
      issues: {
        listComments() {},
        createComment: async (args) => {
          comments.push({
            ...args,
            id: comments.length + 1,
            user: { login: 'github-actions[bot]' },
          })
        },
        updateComment: async (args) => {
          const comment = comments.find((item) => item.id === args.comment_id)
          assert.ok(comment)
          comment.body = args.body
        },
      },
    },
  }
  return {
    github,
    context,
    core: {
      setOutput: (key, value) => {
        outputs[key] = value
      },
      warning() {},
    },
    env: {
      REVIEW_HEAD: 'head',
      REVIEW_REPORT: 'First report',
      REVIEW_RESULT: 'success',
    },
    comments,
    outputs,
    reactions,
    pr,
    evidence,
    paginateCalls,
  }
}

test('collects pinned evidence, branch rules and only a bot-owned previous report', async () => {
  const state = setup()
  const runnerTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'dependabot-review-'))
  try {
    state.comments.push(
      { user: { login: 'human' }, body: '<!-- dependabot-review-report -->\nSpoof' },
      { user: { login: 'github-actions[bot]' }, body: '<!-- dependabot-review-report -->\nPrior' },
    )
    state.evidence.branchRules.push({ type: 'required_status_checks' })
    await collectContext({ ...state, env: { RUNNER_TEMP: runnerTemp } })
    const data = JSON.parse(fs.readFileSync(path.join(runnerTemp, 'dependabot-context.json'), 'utf8'))
    assert.equal(data.pr.head.sha, 'head')
    assert.deepEqual(data.branchRules, [{ type: 'required_status_checks' }])
    assert.deepEqual(data.reviewComments, [])
    assert.match(data.previousReport.body, /Prior/)
    assert.ok(state.paginateCalls.some(({ method, args }) =>
      method === state.github.rest.repos.getBranchRules && args.branch === 'develop'))
    assert.equal(state.outputs.base, 'base')
    assert.equal(state.outputs.head, 'head')
  } finally {
    fs.rmSync(runnerTemp, { recursive: true, force: true })
  }
})

test('fails collection when eligibility changes without writing evidence', async () => {
  for (const change of [
    (state) => { state.pr.state = 'closed' },
    (state) => { state.pr.head.repo.full_name = 'fork/repo' },
    (state) => { state.github.rest.repos.getCollaboratorPermissionLevel = async () => ({ data: { permission: 'read' } }) },
  ]) {
    const state = setup()
    const runnerTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'dependabot-review-'))
    try {
      change(state)
      await assert.rejects(collectContext({ ...state, env: { RUNNER_TEMP: runnerTemp } }), /Review stopped/)
      assert.equal(state.outputs.eligible, undefined)
      assert.equal(fs.existsSync(path.join(runnerTemp, 'dependabot-context.json')), false)
    } finally {
      fs.rmSync(runnerTemp, { recursive: true, force: true })
    }
  }
})

test('acknowledges eligible commands and reuses status on reruns', async () => {
  const state = setup()
  await acknowledge(state)
  await acknowledge(state)
  assert.equal(state.outputs.eligible, 'true')
  assert.equal(state.reactions.length, 2)
  assert.equal(state.reactions[0].content, 'eyes')
  assert.equal(state.comments.length, 1)
})

test('rejects unauthorized commands without posting or reacting', async () => {
  const state = setup({ permission: 'read' })
  await acknowledge(state)
  assert.equal(state.outputs.eligible, undefined)
  assert.equal(state.comments.length, 0)
  assert.equal(state.reactions.length, 0)
})

test('explains ineligible PRs without invoking the reviewer', async () => {
  for (const mutation of [
    (pr) => {
      pr.state = 'closed'
    },
    (pr) => {
      pr.user.login = 'human'
    },
    (pr) => {
      pr.head.repo.full_name = 'fork/repo'
    },
  ]) {
    const state = setup()
    mutation(state.pr)
    await acknowledge(state)
    assert.equal(state.outputs.eligible, undefined)
    assert.match(state.comments[0].body, /review did not run/)
  }
})

test('reaction failure does not prevent review', async () => {
  const state = setup({ reactionFails: true })
  await acknowledge(state)
  assert.equal(state.outputs.eligible, 'true')
  assert.equal(state.comments.length, 1)
})

test('reruns replace one bot-owned report and status, ignoring spoofed markers', async () => {
  const state = setup()
  state.comments.push({
    id: 100,
    user: { login: 'human' },
    body: '<!-- dependabot-review-report -->\nSpoof',
  })
  await acknowledge(state)
  await publish(state)
  state.env.REVIEW_REPORT = 'Updated report: one finding resolved'
  await publish(state)
  assert.equal(state.comments.length, 3)
  assert.equal(
    state.comments[0].body,
    '<!-- dependabot-review-report -->\nSpoof',
  )
  const report = state.comments.find(
    (comment) =>
      comment.user.login === 'github-actions[bot]' &&
      comment.body.startsWith('<!-- dependabot-review-report -->'),
  )
  assert.match(report.body, /Updated report/)
  assert.doesNotMatch(report.body, /First report/)
})

test('failed, stale, empty and oversized reruns preserve the previous report', async () => {
  for (const change of [
    (state) => {
      state.env.REVIEW_RESULT = 'failure'
    },
    (state) => {
      state.pr.head.sha = 'new'
    },
    (state) => {
      state.pr.state = 'closed'
    },
    (state) => {
      state.env.REVIEW_REPORT = ''
    },
    (state) => {
      state.env.REVIEW_REPORT = 'x'.repeat(20001)
    },
  ]) {
    const state = setup()
    await publish(state)
    change(state)
    await publish(state)
    assert.equal(state.comments.length, 2)
    assert.match(state.comments[0].body, /First report/)
    assert.doesNotMatch(state.comments[1].body, /Review completed/)
  }
})
