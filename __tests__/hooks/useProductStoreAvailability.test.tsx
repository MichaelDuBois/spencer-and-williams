import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useProductStoreAvailability } from '@/hooks/useProductStoreAvailability'

import type { ReactNode } from 'react'

declare global {
   
  var __searchString__: string | undefined
}

vi.mock('next/navigation', () => {return {
  useSearchParams: () => new URLSearchParams(globalThis.__searchString__ ?? ''),
}})

const rawHitMock = vi.fn()
vi.mock('@/hooks/useGetRawHit', () => {return {
  useGetRawHit: (...args: unknown[]) => rawHitMock(...args),
}})

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('useProductStoreAvailability', () => {
  it('isAvailable is false when ?productId is absent', () => {
    globalThis.__searchString__ = ''
    rawHitMock.mockReturnValue({ data: null, isLoading: false })
    const { result } = renderHook(() => useProductStoreAvailability(), {
      wrapper,
    })
    expect(result.current.isAvailable).toBe(false)
    expect(result.current.allowedStoreIds).toEqual([])
  })

  it('derives allowedStoreIds and stockByStoreId from product.availableInStores', () => {
    globalThis.__searchString__ = 'productId=abc'
    rawHitMock.mockReturnValue({
      data: {
        objectID: 'abc',
        name: 'Test',
        availableInStores: [
          { inStock: true, objectID: '1' },
          { inStock: false, objectID: '2' },
        ],
      },
      isLoading: false,
    })
    const { result } = renderHook(() => useProductStoreAvailability(), {
      wrapper,
    })
    expect(result.current.isAvailable).toBe(true)
    expect(result.current.allowedStoreIds).toEqual(['1', '2'])
    expect(result.current.stockByStoreId).toEqual({ '1': true, '2': false })
  })

  it('returns empty arrays when product has no availableInStores', () => {
    globalThis.__searchString__ = 'productId=abc'
    rawHitMock.mockReturnValue({
      data: { objectID: 'abc', name: 'Test' },
      isLoading: false,
    })
    const { result } = renderHook(() => useProductStoreAvailability(), {
      wrapper,
    })
    expect(result.current.allowedStoreIds).toEqual([])
    expect(result.current.stockByStoreId).toEqual({})
  })
})
