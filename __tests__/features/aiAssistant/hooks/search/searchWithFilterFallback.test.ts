import { describe, expect, it, vi } from 'vitest'

import { searchWithFilterFallback } from '@/features/aiAssistant/hooks/search/searchWithFilterFallback'
import type { AssistantSearchRequest } from '@/features/aiAssistant/hooks/search/searchWithFilterFallback'
import type { SearchQuery } from '@/features/aiAssistant/types'

import type { liteClient } from 'algoliasearch/lite'

type FakeSearchClient = { search: ReturnType<typeof vi.fn> }

/** Mirrors a caller's `buildRequest`: baseline stays, the agent's half drops. */
const buildRequest = (
  query: SearchQuery,
  withAgentFilters: boolean,
): AssistantSearchRequest => {
  return {
    indexName: 'titles',
    query: query.query,
    params: {
      hitsPerPage: 5,
      filters:
        withAgentFilters && query.filters
          ? `baseline AND (${query.filters})`
          : 'baseline',
    },
  }
}

/** One `search` response per call, each a list of per-request hit lists. */
const buildSearchClient = (
  batches: Array<Array<Array<Record<string, unknown>>>>,
): FakeSearchClient => {
  let call = 0

  return {
    search: vi.fn(async () => {
      const batch = batches[call] ?? []
      call += 1

      return {
        results: batch.map((hits) => {
          return { hits }
        }),
      }
    }),
  }
}

const run = (queries: SearchQuery[], searchClient: FakeSearchClient) =>
  searchWithFilterFallback({
    queries,
    searchClient: searchClient as unknown as ReturnType<typeof liteClient>,
    buildRequest,
  })

/** The request payload sent on the nth `search` call. */
const requestsOf = (searchClient: FakeSearchClient, call: number) =>
  searchClient.search.mock.calls[call][0] as AssistantSearchRequest[]

describe('searchWithFilterFallback', () => {
  it('issues no request and returns nothing without queries', async () => {
    const searchClient = buildSearchClient([[[{ objectID: 'a' }]]])

    await expect(run([], searchClient)).resolves.toEqual([])
    expect(searchClient.search).not.toHaveBeenCalled()
  })

  it('rebuilds the whole batch without agent filters when it is rejected', async () => {
    let call = 0
    const searchClient: FakeSearchClient = {
      search: vi.fn(async () => {
        call += 1
        if (call === 1) throw new Error('invalid filters')

        return { results: [{ hits: [{ objectID: 'a' }] }, { hits: [] }] }
      }),
    }

    const hits = await run(
      [
        { query: 'comedy', filters: 'genres:"Comedy" AND (' },
        { query: 'drama', filters: 'genres:"Drama"' },
      ],
      searchClient,
    )

    expect(searchClient.search).toHaveBeenCalledTimes(2)
    expect(requestsOf(searchClient, 1)).toEqual([
      {
        indexName: 'titles',
        query: 'comedy',
        params: { hitsPerPage: 5, filters: 'baseline' },
      },
      {
        indexName: 'titles',
        query: 'drama',
        params: { hitsPerPage: 5, filters: 'baseline' },
      },
    ])
    expect(hits).toEqual([{ objectID: 'a', __position: 1 }])
  })

  it('does not retry individually after a whole-batch fallback', async () => {
    const searchClient: FakeSearchClient = {
      search: vi.fn(async () => {
        if (searchClient.search.mock.calls.length === 1) {
          throw new Error('invalid filters')
        }

        return { results: [{ hits: [] }] }
      }),
    }

    const hits = await run(
      [{ query: 'comedy', filters: 'genres:"Comedy" AND (' }],
      searchClient,
    )

    expect(searchClient.search).toHaveBeenCalledTimes(2)
    expect(hits).toEqual([])
  })

  it('propagates the retry rejection when the filter-free fallback also fails', async () => {
    const searchClient: FakeSearchClient = {
      search: vi.fn(async () => {
        if (searchClient.search.mock.calls.length === 1) {
          throw new Error('invalid filters')
        }

        throw new Error('total outage')
      }),
    }

    await expect(
      run(
        [{ query: 'comedy', filters: 'genres:"Comedy" AND (' }],
        searchClient,
      ),
    ).rejects.toThrow('total outage')

    expect(searchClient.search).toHaveBeenCalledTimes(2)
  })

  it('retries only the filtered queries that matched nothing', async () => {
    const searchClient = buildSearchClient([
      [[{ objectID: 'a' }], [], []],
      [[{ objectID: 'b' }]],
    ])

    const hits = await run(
      [
        { query: 'comedy', filters: 'genres:"Comedy"' },
        { query: 'drama', filters: 'genres:"Nope"' },
        { query: 'nothing matches this' },
      ],
      searchClient,
    )

    expect(searchClient.search).toHaveBeenCalledTimes(2)
    expect(requestsOf(searchClient, 1)).toEqual([
      {
        indexName: 'titles',
        query: 'drama',
        params: { hitsPerPage: 5, filters: 'baseline' },
      },
    ])
    expect(hits).toEqual([
      { objectID: 'a', __position: 1 },
      { objectID: 'b', __position: 1 },
    ])
  })

  it('keeps retried hits in their original query encounter order', async () => {
    const searchClient = buildSearchClient([
      [[], [{ objectID: 'later' }]],
      [[{ objectID: 'earlier' }]],
    ])

    const hits = await run(
      [
        { query: 'earlier', filters: 'genres:"Nope"' },
        { query: 'later' },
      ],
      searchClient,
    )

    expect(hits).toEqual([
      { objectID: 'earlier', __position: 1 },
      { objectID: 'later', __position: 1 },
    ])
  })

  it('keeps the first-stage hits when the individual retry is rejected', async () => {
    const searchClient: FakeSearchClient = {
      search: vi.fn(async () => {
        if (searchClient.search.mock.calls.length === 2) {
          throw new Error('network down')
        }

        return { results: [{ hits: [{ objectID: 'a' }] }, { hits: [] }] }
      }),
    }

    const hits = await run(
      [
        { query: 'comedy', filters: 'genres:"Comedy"' },
        { query: 'drama', filters: 'genres:"Nope"' },
      ],
      searchClient,
    )

    expect(searchClient.search).toHaveBeenCalledTimes(2)
    expect(hits).toEqual([{ objectID: 'a', __position: 1 }])
  })

  it('keeps the first occurrence of a duplicate and skips a falsy objectID', async () => {
    const searchClient = buildSearchClient([
      [
        [{ objectID: 'a', title: 'first' }, { objectID: '' }],
        [
          { objectID: 'b' },
          { objectID: 'a', title: 'second' },
          { title: 'no id' },
        ],
      ],
    ])

    const hits = await run(
      [{ query: 'comedy' }, { query: 'funny' }],
      searchClient,
    )

    expect(hits).toEqual([
      { objectID: 'a', title: 'first', __position: 1 },
      { objectID: 'b', __position: 1 },
    ])
  })

  it('tolerates result entries that carry no hits', async () => {
    const searchClient: FakeSearchClient = {
      search: vi.fn(async () => {
        return {
          results: [
            { facetHits: [{ value: 'Comedy', count: 3 }] },
            undefined,
            { hits: [{ objectID: 'a' }] },
          ],
        }
      }),
    }

    const hits = await run(
      [{ query: 'comedy' }, { query: 'drama' }, { query: 'thriller' }],
      searchClient,
    )

    expect(searchClient.search).toHaveBeenCalledTimes(1)
    expect(hits).toEqual([{ objectID: 'a', __position: 1 }])
  })

  it('stamps each hit with its response queryID and 1-based position', async () => {
    const searchClient: FakeSearchClient = {
      search: vi.fn(async () => {
        return {
          results: [
            { hits: [{ objectID: 'a' }, { objectID: 'b' }], queryID: 'q1' },
            { hits: [{ objectID: 'c' }], queryID: 'q2' },
          ],
        }
      }),
    }

    const hits = await run(
      [{ query: 'comedy' }, { query: 'drama' }],
      searchClient,
    )

    expect(hits).toEqual([
      { objectID: 'a', __queryID: 'q1', __position: 1 },
      { objectID: 'b', __queryID: 'q1', __position: 2 },
      { objectID: 'c', __queryID: 'q2', __position: 1 },
    ])
  })

  it('restamps attribution when a narrow query is retried', async () => {
    let call = 0
    const searchClient: FakeSearchClient = {
      search: vi.fn(async () => {
        call += 1
        if (call === 1) {
          return {
            results: [{ hits: [], queryID: 'q-stage-one' }],
          }
        }

        return { results: [{ hits: [{ objectID: 'a' }], queryID: 'q-retry' }] }
      }),
    }

    const hits = await run(
      [{ query: 'comedy', filters: 'genres:"Comedy"' }],
      searchClient,
    )

    expect(hits).toEqual([
      { objectID: 'a', __queryID: 'q-retry', __position: 1 },
    ])
  })
})
