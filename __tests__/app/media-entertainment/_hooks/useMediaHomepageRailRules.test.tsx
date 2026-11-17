import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaHomepageRailRules } from '@/app/media-entertainment/_hooks/useMediaHomepageRailRules'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { AlgoliaRule } from '@/lib/algoliaRules'

import { buildProvidersWrapper } from '@tests/helpers/test-utils'

const CONFIGURED_RAILS = mediaEntertainmentConfig.homepageRails ?? []

const fetchMock = vi.fn()

const createRailRule = ({
  context,
  description,
}: {
  context: string
  description?: string
}): AlgoliaRule => {
  return {
    objectID: context,
    enabled: true,
    description,
    conditions: [{ context }],
    consequence: { params: { filters: 'record_type:movie' } },
    _metadata: { lastUpdate: 1787574551 },
  }
}

/** Every context config pins, so nothing is dropped as rule-less. */
const configuredRules = CONFIGURED_RAILS.flatMap((rail) =>
  'filterRuleContexts' in rail
    ? (rail.filterRuleContexts ?? []).map((context) =>
        createRailRule({ context }),
      )
    : [],
)

const mockRules = (hits: AlgoliaRule[]) => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => {
      return { hits }
    },
  })
}

const renderRailRules = () =>
  renderHook(() => useMediaHomepageRailRules(), {
    wrapper: buildProvidersWrapper().Wrapper,
  })

describe('useMediaHomepageRailRules', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('titles the configured rails from their rules and appends the discovered one', async () => {
    mockRules([
      ...configuredRules,
      createRailRule({
        context: 'homepage_me_award_winners',
        description: 'Homepage rail: Award Winners (~120 titles)',
      }),
    ])

    const { result } = renderRailRules()

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(result.current.rails.map((rail) => rail.id)).toEqual([
      ...CONFIGURED_RAILS.map((rail) => rail.id),
      'homepage_me_award_winners',
    ])
    expect(result.current.rails.at(-1)?.title).toBe('Award Winners')
  })

  it('never discovers the billboard rule as a rail', async () => {
    mockRules([
      ...configuredRules,
      createRailRule({ context: 'homepage_me_billboard' }),
    ])

    const { result } = renderRailRules()

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(result.current.rails.map((rail) => rail.id)).toEqual(
      CONFIGURED_RAILS.map((rail) => rail.id),
    )
  })

  it('drops a configured rail once its rule is gone', async () => {
    mockRules(
      configuredRules.filter(
        (rule) => rule.objectID !== 'homepage_me_blockbusters',
      ),
    )

    const { result } = renderRailRules()

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(result.current.rails.map((rail) => rail.id)).not.toContain(
      'blockbusters',
    )
  })

  it('falls back to the configured rails when the rules cannot be read', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 })

    const { result } = renderRailRules()

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(result.current.rails).toEqual(CONFIGURED_RAILS)
  })

  // The homepage holds its batched search back on this flag, so reporting the
  // config list here is what lets the skeletons paint the real row titles.
  it('reports the configured rails while the rules are still in flight', () => {
    fetchMock.mockReturnValue(new Promise(() => {}))

    const { result } = renderRailRules()

    expect(result.current.isPending).toBe(true)
    expect(result.current.rails).toEqual(CONFIGURED_RAILS)
  })
})
