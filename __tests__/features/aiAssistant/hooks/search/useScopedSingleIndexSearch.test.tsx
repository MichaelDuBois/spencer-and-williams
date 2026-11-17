import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useB2BCatalogPricing } from '@/app/b2b-warehouse/_hooks/useB2BCatalogPricing'
import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { useSingleIndexSearch } from '@/features/aiAssistant/hooks/search/useSingleIndexSearch'
import { activeConfigAtom } from '@/stores/activeConfig'
import { setPersonaModeAtom } from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'
import { selectedStoreAtom } from '@/stores/selectedStore'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const A = {
  objectID: 'A',
  name: 'Drill',
  price: 100,
  visible_by: [GROUP_0.groupId],
  availableInStores: [{ objectID: '1' }],
}
const FILTERS =
  'visible_by:"customer_group_0" AND availableInStores.objectID:"1"'
const PREFIX = ['b2b-products', 'scope-0']
const setup = () => {
  const search = vi.fn().mockResolvedValue({ results: [{ hits: [A] }] })
  const controller = new AbortController()
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'b2b-warehouse',
        algolia: {
          appId: 'APP',
          apiKey: 'KEY',
          primaryIndex: {
            name: 'products',
            template: { attributes: { name: 'name', price: 'price' } },
          },
          indices: {},
        },
      }),
    )
    s.set(setPersonaModeAtom, GROUP_0)
    s.set(selectedStoreAtom, { vertical: 'b2b-warehouse', storeId: '1' })
    s.set(baseSearchClientAtom, createMockSearchClient({ search }))
  })
  const providers = buildProvidersWrapper({ store })
  const hook = renderHook(
    () =>
      useSingleIndexSearch({
        extractor: getB2BWarehouseProductHitValues,
        getPrice: useB2BCatalogPricing(),
        queryOptions: useB2BProductHitOptions(),
        productCacheKey: PREFIX,
        signal: controller.signal,
      }),
    { wrapper: providers.Wrapper },
  )
  return { ...providers, ...hook, search, controller }
}

describe('scoped assistant product search', () => {
  it.each(['empty', 'rejected'])(
    'keeps mandatory filters through the %s fallback',
    async (failure) => {
      const { result, search, queryClient } = setup()
      if (failure === 'empty')
        search.mockResolvedValueOnce({ results: [{ hits: [] }] })
      else search.mockRejectedValueOnce(new Error('Invalid filters'))
      await act(async () => {
        await result.current([
          { query: 'drill', filters: 'brand:"One" OR brand:"Two"' },
        ])
      })
      expect(search.mock.calls[0][0][0].params.filters).toBe(
        `(brand:"One" OR brand:"Two") AND ${FILTERS}`,
      )
      expect(search.mock.calls[1][0][0].params.filters).toBe(FILTERS)
      expect(queryClient.getQueryData([...PREFIX, 'A'])).toMatchObject({
        objectID: 'A',
        name: 'Drill',
      })
      expect(queryClient.getQueryData(['product', 'A'])).toBeUndefined()
    },
  )

  it('does not summarize or cache an ineligible hit returned by the service', async () => {
    const { result, search, queryClient } = setup()
    search.mockResolvedValue({
      results: [{ hits: [{ ...A, visible_by: ['other'] }] }],
    })
    expect(await result.current([{ query: 'drill' }])).toEqual({
      summaries: [],
    })
    expect(queryClient.getQueryData([...PREFIX, 'A'])).toBeUndefined()
  })

  it('does not cache a late response after cancellation', async () => {
    const { result, search, queryClient, controller } = setup()
    const pending = Promise.withResolvers<{
      results: { hits: (typeof A)[] }[]
    }>()
    search.mockReturnValue(pending.promise)
    const request = result.current([{ query: 'drill' }])
    controller.abort()
    pending.resolve({ results: [{ hits: [A] }] })
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
    expect(queryClient.getQueryData([...PREFIX, 'A'])).toBeUndefined()
    expect(search).toHaveBeenCalledOnce()
  })
})

it('summarizes customer prices while caching unchanged base values', async () => {
  const { result, store, queryClient, search } = setup()
  expect(await result.current([{ query: 'drill' }])).toEqual({
    summaries: [
      {
        objectID: 'A',
        name: 'Drill',
        price: 100,
        position: 1,
        pricing: { basePrice: 100, customerPrice: 85, discountAmount: 15 },
      },
    ],
  })
  expect(queryClient.getQueryData([...PREFIX, 'A'])).toMatchObject({
    price: 100,
  })
  act(() => store.set(setPersonaModeAtom, GROUP_1))
  search.mockResolvedValue({
    results: [
      { hits: [{ ...A, price: '100', visible_by: [GROUP_1.groupId] }] },
    ],
  })
  expect(await result.current([{ query: 'drill' }])).toEqual({
    summaries: [
      {
        objectID: 'A',
        name: 'Drill',
        price: 100,
        position: 1,
        pricing: { basePrice: 100, customerPrice: 70, discountAmount: 30 },
      },
    ],
  })
  expect(queryClient.getQueryData([...PREFIX, 'A'])).toMatchObject({
    price: 100,
  })
})

it('marks missing prices unavailable in assistant summaries', async () => {
  const { result, search } = setup()
  search.mockResolvedValue({
    results: [{ hits: [{ ...A, price: undefined }] }],
  })
  expect(await result.current([{ query: 'drill' }])).toEqual({
    summaries: [
      { objectID: 'A', name: 'Drill', price: null, position: 1, pricing: null },
    ],
  })
})
