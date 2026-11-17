import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useTravelSearch } from '@/features/aiAssistant/hooks/search/useTravelSearch'
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
  id: 'foodie',
  label: 'Foodie',
  description: 'Travels for food',
  token: 'persona-foodie',
  affinities: { tags: ['food'] },
  optionalFilters: ['tags:food<score=18>'],
}

const QUERIES = [
  { index: 'articles' as const, query: 'kyoto' },
  { index: 'podcasts' as const, query: 'kyoto' },
  { index: 'activities' as const, query: 'kyoto' },
]

const renderSearch = (
  isPersonalizationEnabled = true,
  search = vi.fn().mockResolvedValue({
    results: [{ hits: [] }, { hits: [] }, { hits: [] }],
  }),
) => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'travel',
        algolia: {
          appId: 'APP',
          apiKey: 'KEY',
          primaryIndex: { name: 'travel_media_articles' },
          indices: {
            podcasts: { name: 'travel_media_podcasts' },
            activities: { name: 'travel_media_related_activities' },
          },
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
      useTravelSearch({
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

describe('useTravelSearch — personalization', () => {
  afterEach(() => {
    personalizationStore.set(resetPersonalizationAtom)
  })

  it('sends the persona params on every index request', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const { search, run } = renderSearch()

    await run()

    const expected = {
      hitsPerPage: 10,
      userToken: 'persona-foodie',
      enablePersonalization: true,
      optionalFilters: PERSONA.optionalFilters,
      getRankingInfo: true,
    }
    expect(paramsOf(search)).toEqual([expected, expected, expected])
  })

  it('sends enablePersonalization false when no persona is active', async () => {
    const { search, run } = renderSearch()

    await run()

    const expected = { hitsPerPage: 10, enablePersonalization: false }
    expect(paramsOf(search)).toEqual([expected, expected, expected])
  })

  it('sends only the token when the vertical has personalization disabled', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const { search, run } = renderSearch(false)

    await run()

    const expected = { hitsPerPage: 10, userToken: 'persona-foodie' }
    expect(paramsOf(search)).toEqual([expected, expected, expected])
  })
})
