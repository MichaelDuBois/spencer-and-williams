import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'

import type { ReactNode } from 'react'

const QUERY_KEY = ['product', 'p1']

describe('useCardData', () => {
  it('keeps cached card data observed beyond the cache GC window', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: 20, retry: false } },
    })
    const product = { objectID: 'p1', name: 'Trail Runner' }
    queryClient.setQueryData(QUERY_KEY, product)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result, unmount } = renderHook(
      () => useCardData<typeof product>(undefined, QUERY_KEY),
      { wrapper },
    )

    expect(result.current).toEqual(product)
    expect(
      queryClient.getQueryCache().find({ queryKey: QUERY_KEY })?.getObserversCount(),
    ).toBe(1)

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(queryClient.getQueryData(QUERY_KEY)).toEqual(product)
    expect(result.current).toEqual(product)
    unmount()
    queryClient.clear()
  })

  it('renders direct data without a query provider', () => {
    const product = { objectID: 'p1', name: 'Trail Runner' }
    const { result } = renderHook(() => useCardData(product, QUERY_KEY))

    expect(result.current).toBe(product)
  })
})
