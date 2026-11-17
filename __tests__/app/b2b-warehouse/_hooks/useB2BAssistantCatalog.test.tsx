import { act, renderHook, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useB2BAssistantCatalog } from '@/app/b2b-warehouse/_hooks/useB2BAssistantCatalog'
import {
  chatMessagesState,
  collectedObjectIDsState,
  followUpQueryState,
  initialAIMessageState,
  isAssistantBusyState,
  productContextState,
  suggestionsState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { activeConfigAtom } from '@/stores/activeConfig'
import { setPersonaModeAtom } from '@/stores/personalization'
import { searchClientAtom } from '@/stores/searchClient'
import { selectedStoreAtom } from '@/stores/selectedStore'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const setup = () => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
    s.set(setPersonaModeAtom, GROUP_0)
  })
  const { Wrapper } = buildProvidersWrapper({ store })
  const hook = renderHook(() => useB2BAssistantCatalog(), {
    wrapper: ({ children }) => (
      <StrictMode>
        <Wrapper>{children}</Wrapper>
      </StrictMode>
    ),
  })
  return { ...hook, store }
}

describe('B2B assistant catalog session', () => {
  it('creates a usable session in StrictMode and resets it on group and warehouse changes', () => {
    const { result, store } = setup()
    expect(result.current.isReady).toBe(true)
    const first = result.current
    act(() => {
      store.set(chatMessagesState, [
        {
          id: 'old',
          role: 'user',
          parts: [{ type: 'text', text: 'old group' }],
          createdAt: new Date(),
        },
      ])
      store.set(collectedObjectIDsState, ['A'])
      store.set(suggestionsState, ['old suggestion'])
      store.set(initialAIMessageState, 'old prompt')
      store.set(followUpQueryState, { text: 'old follow-up' })
      store.set(isAssistantBusyState, true)
      store.set(setPersonaModeAtom, GROUP_1)
    })
    expect(first.signal?.aborted).toBe(true)
    expect(result.current.isReady).toBe(true)
    expect(result.current.productCacheKey).not.toEqual(first.productCacheKey)
    expect(result.current.context).toContain(GROUP_1.groupId)
    expect(store.get(chatMessagesState)).toEqual([])
    expect(store.get(collectedObjectIDsState)).toEqual([])
    expect(store.get(suggestionsState)).toEqual([])
    expect(store.get(initialAIMessageState)).toBe('')
    expect(store.get(followUpQueryState)).toBeNull()
    expect(store.get(isAssistantBusyState)).toBe(false)
    const second = result.current
    act(() =>
      store.set(selectedStoreAtom, { vertical: 'b2b-warehouse', storeId: '2' }),
    )
    expect(second.signal?.aborted).toBe(true)
    expect(result.current.productCacheKey).not.toEqual(second.productCacheKey)
    expect(result.current.queryOptions.filters).toContain(
      'availableInStores.objectID:"2"',
    )
    expect(result.current.context).toContain('Warehouse: 2')
  })

  it('aborts manual resets and unmounts, and disables invalid policies', async () => {
    const { result, store, unmount } = setup()
    const first = result.current
    act(() => result.current.resetSession())
    expect(first.signal?.aborted).toBe(true)
    expect(result.current.sessionKey).not.toEqual(first.sessionKey)
    expect(result.current.productCacheKey).toEqual(first.productCacheKey)
    act(() => store.set(setPersonaModeAtom, { ...GROUP_0, discount: 2 }))
    await waitFor(() => expect(result.current.isReady).toBe(false))
    expect(result.current.productContext).toBeNull()
    const signal = result.current.signal
    unmount()
    expect(signal?.aborted).toBe(true)
  })
})

it('withholds page product context until a current-scope lookup validates it', async () => {
  const { result, store } = setup()
  const pageProduct = {
    objectID: 'A',
    name: 'Drill',
    price: 100,
    productUrl: '/b2b-warehouse/product/A',
  }
  const search = vi.fn().mockResolvedValue({
    results: [{ hits: [{ ...pageProduct, visible_by: [GROUP_0.groupId] }] }],
  })
  act(() => {
    store.set(searchClientAtom, createMockSearchClient({ search }))
    store.set(productContextState, pageProduct)
  })
  expect(result.current.productContext).toBeNull()
  await waitFor(() =>
    expect(result.current.productContext).toEqual({
      ...pageProduct,
      pricing: { basePrice: 100, customerPrice: 85, discountAmount: 15 },
    }),
  )
  act(() => store.set(setPersonaModeAtom, GROUP_1))
  expect(result.current.productContext).toBeNull()
  await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
  expect(result.current.productContext).toBeNull()
})
