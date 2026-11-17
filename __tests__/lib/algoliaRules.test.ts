import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchIndexRules } from '@/lib/algoliaRules'

const credentials = { appId: 'APP_ID', apiKey: 'API_KEY' }

const fetchMock = vi.fn()

const fetchRules = () =>
  fetchIndexRules({ credentials, indexName: 'media_ns' })

describe('fetchIndexRules', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts to the index rules search endpoint with the admin-free key headers', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        return { hits: [{ objectID: 'homepage_me_top_10' }] }
      },
    })

    const rules = await fetchRules()

    expect(rules).toEqual([{ objectID: 'homepage_me_top_10' }])

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(
      'https://APP_ID-dsn.algolia.net/1/indexes/media_ns/rules/search',
    )
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({
      'X-Algolia-API-Key': 'API_KEY',
      'X-Algolia-Application-Id': 'APP_ID',
      'Content-Type': 'application/json',
    })
    expect(JSON.parse(init.body)).toEqual({ hitsPerPage: 1000 })
  })

  it('reports an empty rule set rather than null when the index has none', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        return {}
      },
    })

    expect(await fetchRules()).toEqual([])
  })

  // Null, not `[]`: callers have to be able to tell "no rails" from "the key
  // cannot read rules", because only the second one means config stands.
  it('returns null when the key may not read rules', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 })

    expect(await fetchRules()).toBeNull()
  })

  it('returns null when the request throws', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))

    expect(await fetchRules()).toBeNull()
  })
})
