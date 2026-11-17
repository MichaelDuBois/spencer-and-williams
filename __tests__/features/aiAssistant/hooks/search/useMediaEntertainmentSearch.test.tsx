import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import {
  getMediaTitleQueryKey,
  useMediaEntertainmentSearch,
} from '@/features/aiAssistant/hooks/search/useMediaEntertainmentSearch'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { Persona } from '@/types'

import type { ReactNode } from 'react'

const KIDS_PROFILE = mediaEntertainmentConfig.assistant.restrictedProfileIds[0]

const buildHit = (objectID: string, overrides: Record<string, unknown> = {}) => {
  return {
    objectID,
    title: `Title ${objectID}`,
    record_type: 'movie',
    genres: ['Comedy'],
    vote_average: 7.5,
    vote_count: 1200,
    ...overrides,
  }
}

/** One `search` response per call, each a list of per-request hit lists. */
const buildSearchClient = (
  batches: Array<Array<Array<Record<string, unknown>>>>,
) => {
  let call = 0

  return {
    search: vi.fn(async () => {
      const batch = batches[Math.min(call, batches.length - 1)] ?? []
      call += 1

      return { results: batch.map((hits) => {return { hits }}) }
    }),
  }
}

const buildRejectingSearchClient = (
  fallback: Array<Array<Record<string, unknown>>>,
) => {
  let call = 0

  return {
    search: vi.fn(async () => {
      call += 1
      if (call === 1) throw new Error('Invalid filters')

      return { results: fallback.map((hits) => {return { hits }}) }
    }),
  }
}

const wrap = (
  store: ReturnType<typeof createStore>,
  queryClient: QueryClient,
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )

  return Wrapper
}

interface SetupArgs {
  searchClient: { search: ReturnType<typeof vi.fn> }
  personaId?: string
  slug?: string
}

const setup = ({
  searchClient,
  personaId,
  slug = mediaEntertainmentConfig.slug,
}: SetupArgs) => {
  const store = createStore()
  const queryClient = new QueryClient()

  store.set(activeConfigAtom, { ...mediaEntertainmentConfig, slug })
  store.set(baseSearchClientAtom, searchClient as never)

  if (personaId) {
    personalizationStore.set(activePersonaAtom, { id: personaId } as Persona)
  }

  const { result } = renderHook(() => useMediaEntertainmentSearch(), {
    wrapper: wrap(store, queryClient),
  })

  return { search: result.current, queryClient }
}

/** The `filters` string sent on the nth `search` call, mth request in the batch. */
const filtersOf = (
  searchClient: { search: ReturnType<typeof vi.fn> },
  call: number,
  request = 0,
): string => searchClient.search.mock.calls[call][0][request].params.filters

/** The `query` text sent on the nth `search` call, mth request in the batch. */
const queryOf = (
  searchClient: { search: ReturnType<typeof vi.fn> },
  call: number,
  request = 0,
): string => searchClient.search.mock.calls[call][0][request].query

describe('useMediaEntertainmentSearch', () => {
  beforeEach(() => {
    // The personalization atoms live on the global store, so reset them here.
    personalizationStore.set(activePersonaAtom, null)
    personalizationStore.set(realtimePersoEnabledAtom, false)
    personalizationStore.set(realtimeSessionTokenAtom, '')
  })

  it('returns empty summaries and issues no request without queries', async () => {
    const searchClient = buildSearchClient([[[]]])
    const { search } = setup({ searchClient })

    await expect(search([])).resolves.toEqual({ summaries: [] })
    expect(searchClient.search).not.toHaveBeenCalled()
  })

  it('does not search when another vertical is active', async () => {
    const searchClient = buildSearchClient([[[buildHit('1')]]])
    const { search } = setup({ searchClient, slug: 'ecommerce' })

    await expect(search([{ query: 'comedy' }])).resolves.toEqual({
      summaries: [],
    })
    expect(searchClient.search).not.toHaveBeenCalled()
  })

  it('applies the quality floor and ANDs the agent filters onto it', async () => {
    const searchClient = buildSearchClient([[[buildHit('1')]]])
    const { search } = setup({ searchClient })

    await search([{ query: 'comedy', filters: 'genres:"Comedy"' }])

    expect(filtersOf(searchClient, 0)).toBe(
      `vote_count >= ${mediaEntertainmentConfig.assistant.qualityFloor} AND (genres:"Comedy")`,
    )
  })

  it('summarises hits and caches each title for the poster cards', async () => {
    const searchClient = buildSearchClient([
      [[buildHit('1'), buildHit('2', { record_type: 'show' })]],
    ])
    const { search, queryClient } = setup({ searchClient })

    const { summaries } = await search([{ query: 'comedy' }])

    expect(summaries).toHaveLength(2)
    expect(summaries[0]).toMatchObject({ objectID: '1', type: 'movie' })
    expect(summaries[1]).toMatchObject({ objectID: '2', type: 'show' })
    expect(queryClient.getQueryData(getMediaTitleQueryKey('1'))).toMatchObject({
      objectID: '1',
      title: 'Title 1',
    })
  })

  it('drops duplicate objectIDs across queries', async () => {
    const searchClient = buildSearchClient([
      [[buildHit('1')], [buildHit('1'), buildHit('2')]],
    ])
    const { search } = setup({ searchClient })

    const { summaries } = await search([
      { query: 'comedy' },
      { query: 'funny' },
    ])

    expect(summaries.map((summary) => summary.objectID)).toEqual(['1', '2'])
  })

  describe('restricted profile', () => {
    it('adds the maturity guard for a restricted profile', async () => {
      const searchClient = buildSearchClient([[[buildHit('1')]]])
      const { search } = setup({ searchClient, personaId: KIDS_PROFILE })

      await search([{ query: 'horror' }])

      const filters = filtersOf(searchClient, 0)
      expect(filters).toContain('NOT certification:"R"')
      expect(filters).toContain('NOT certification:"NR"')
      expect(filters).toContain('NOT genres:"Horror"')
    })

    it('omits the guard for an unrestricted profile', async () => {
      const searchClient = buildSearchClient([[[buildHit('1')]]])
      const { search } = setup({ searchClient, personaId: 'marvel-fan' })

      await search([{ query: 'horror' }])

      expect(filtersOf(searchClient, 0)).not.toContain('NOT certification:')
    })

    // The whole point of enforcing this in the client rather than the prompt: it
    // has to hold on the paths where the agent's own expression is thrown away.
    it('keeps the guard when a malformed agent filter forces a retry', async () => {
      const searchClient = buildRejectingSearchClient([[buildHit('1')]])
      const { search } = setup({ searchClient, personaId: KIDS_PROFILE })

      const { summaries } = await search([
        { query: 'horror', filters: 'genres:"Horror" AND (' },
      ])

      expect(searchClient.search).toHaveBeenCalledTimes(2)

      const retryFilters = filtersOf(searchClient, 1)
      expect(retryFilters).toContain('NOT certification:"NR"')
      expect(retryFilters).toContain('NOT genres:"Horror"')
      expect(retryFilters).not.toContain('genres:"Horror" AND (')
      expect(queryOf(searchClient, 1)).toBe('horror')
      expect(summaries).toHaveLength(1)
    })

    it('keeps the guard when an over-narrow agent filter returns nothing', async () => {
      const searchClient = buildSearchClient([
        [[]],
        [[buildHit('1')]],
      ])
      const { search } = setup({ searchClient, personaId: KIDS_PROFILE })

      const { summaries } = await search([
        { query: 'horror', filters: 'genres:"Horror" AND runtime < 5' },
      ])

      expect(searchClient.search).toHaveBeenCalledTimes(2)

      const retryFilters = filtersOf(searchClient, 1)
      expect(retryFilters).toContain('NOT certification:"NR"')
      expect(retryFilters).not.toContain('runtime < 5')
      expect(queryOf(searchClient, 1)).toBe('horror')
      expect(summaries).toHaveLength(1)
    })

    it('does not retry a query that returned nothing without agent filters', async () => {
      const searchClient = buildSearchClient([[[]]])
      const { search } = setup({ searchClient })

      await search([{ query: 'nothing matches this' }])

      expect(searchClient.search).toHaveBeenCalledTimes(1)
    })
  })
})
