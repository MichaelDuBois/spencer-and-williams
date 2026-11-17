import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useB2BContentSearch } from '@/features/aiAssistant/hooks/search/useB2BContentSearch'
import { usePersonalizationSearchParams } from '@/hooks/usePersonalizationSearchParams'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  personalizationStore,
  resetPersonalizationAtom,
  setPersonaModeAtom,
} from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { Persona } from '@/types'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '@tests/helpers/test-utils'

vi.mock('@/hooks/useRealtimeProfile', () => {
  return {
    useRealtimeProfile: () => {
      return { data: undefined }
    },
  }
})

const PERSONA: Persona = {
  type: 'persona',
  id: 'developer',
  label: 'Developer',
  description: 'Reads API docs',
  token: 'persona-developer',
  affinities: { category: ['API'] },
  optionalFilters: ['category:API<score=5>'],
}

const QUERIES = [
  { index: 'documentation' as const, query: 'search' },
  { index: 'blogs' as const, query: 'search' },
]

const renderSearch = (
  isPersonalizationEnabled = true,
  search = vi.fn().mockResolvedValue({
    results: [{ hits: [] }, { hits: [] }],
  }),
) => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'b2b-content',
        algolia: {
          appId: 'APP',
          apiKey: 'KEY',
          primaryIndex: { name: 'documentation_algolia_2025' },
          indices: { blogs: { name: 'documentation_blogs_2026' } },
        },
        features: {
          agentStudio: {},
          personalization: {
            enabled: isPersonalizationEnabled,
            personas: [PERSONA],
          },
        },
      }),
    )
    s.set(baseSearchClientAtom, { search } as never)
  })
  const { result } = renderHook(
    () =>
      useB2BContentSearch({
        personalizationParams: usePersonalizationSearchParams(),
      }),
    {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    },
  )
  return { search, run: () => result.current(QUERIES) }
}

const paramsOf = (search: ReturnType<typeof vi.fn>) =>
  search.mock.calls[0][0].map(
    (request: { params: Record<string, unknown> }) => request.params,
  )

describe('useB2BContentSearch — personalization', () => {
  afterEach(() => {
    personalizationStore.set(resetPersonalizationAtom)
  })

  it('sends the persona params on every index request', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const { search, run } = renderSearch()

    await run()

    const expected = {
      hitsPerPage: 10,
      userToken: 'persona-developer',
      enablePersonalization: true,
      optionalFilters: PERSONA.optionalFilters,
      getRankingInfo: true,
    }
    expect(paramsOf(search)).toEqual([expected, expected])
  })

  it('sends enablePersonalization false when no persona is active', async () => {
    const { search, run } = renderSearch()

    await run()

    expect(paramsOf(search)).toEqual([
      { hitsPerPage: 10, enablePersonalization: false },
      { hitsPerPage: 10, enablePersonalization: false },
    ])
  })

  it('sends only the token when the vertical has personalization disabled', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const { search, run } = renderSearch(false)

    await run()

    expect(paramsOf(search)).toEqual([
      { hitsPerPage: 10, userToken: 'persona-developer' },
      { hitsPerPage: 10, userToken: 'persona-developer' },
    ])
  })

  // One multi-query request, so a single index rejecting fails the whole batch.
  it('rejects the whole search when one index rejects the persona params', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const error = new Error('Unknown attribute in optionalFilters')
    const { search, run } = renderSearch(true, vi.fn().mockRejectedValue(error))

    await expect(run()).rejects.toBe(error)
    expect(search).toHaveBeenCalledTimes(1)
    expect(paramsOf(search)).toHaveLength(2)
  })
})
