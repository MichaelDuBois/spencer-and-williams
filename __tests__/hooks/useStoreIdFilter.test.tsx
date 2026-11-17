import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import {
  ignoredUrlStoreIdAtom,
  selectedStoreAtom,
  selectedStoreStore,
} from '@/stores/selectedStore'

import { buildJotaiWrapper } from '../helpers/jotai-wrapper'

import type { ReactNode } from 'react'

declare global {

  var __searchString__: string | undefined
}

const replaceMock = vi.fn()

vi.mock('next/navigation', () => {return {
  useSearchParams: () => new URLSearchParams(globalThis.__searchString__ ?? ''),
  useRouter: () => {return { replace: replaceMock }},
  usePathname: () => '/fashion/search',
}})

vi.mock('@/hooks/useGetRawHit', () => {return {
  useGetRawHit: () => {return { data: null, isLoading: false, isError: false }},
}})

vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => {return {
    slug: 'fashion',
    algolia: { indices: { locations: { name: 'locations' } } },
  }},
}})

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

/** Same as `wrapper`, plus a fresh Jotai store for non-pinned atoms. */
const createIsolatedWrapper = () => {
  const JotaiWrapper = buildJotaiWrapper()
  const IsolatedWrapper = ({ children }: { children: ReactNode }) => (
    <JotaiWrapper>{wrapper({ children })}</JotaiWrapper>
  )
  return IsolatedWrapper
}

describe('useStoreIdFilter', () => {
  beforeEach(() => {
    // The pinned atoms live in jotai's global store, so reset them between tests.
    selectedStoreStore.set(selectedStoreAtom, null)
    selectedStoreStore.set(ignoredUrlStoreIdAtom, null)
  })

  it('returns null when ?storeId is absent', () => {
    globalThis.__searchString__ = ''
    const { result } = renderHook(() => useStoreIdFilter(), { wrapper })
    expect(result.current.storeId).toBeNull()
  })

  it('parses ?storeId from the URL', () => {
    globalThis.__searchString__ = 'storeId=42'
    const { result } = renderHook(() => useStoreIdFilter(), { wrapper })
    expect(result.current.storeId).toBe('42')
  })

  it('hydrates the param when the ignore is scoped to another vertical', () => {
    selectedStoreStore.set(ignoredUrlStoreIdAtom, {
      vertical: 'grocery',
      storeId: '42',
    })
    globalThis.__searchString__ = 'storeId=42'
    const { result } = renderHook(() => useStoreIdFilter(), { wrapper })
    expect(result.current.storeId).toBe('42')
  })

  it('clear() calls router.replace without the storeId param', () => {
    globalThis.__searchString__ = 'storeId=42&q=jacket'
    const { result } = renderHook(() => useStoreIdFilter(), { wrapper })
    act(() => result.current.clear())
    expect(replaceMock).toHaveBeenCalledWith(
      expect.stringContaining('q=jacket'),
      expect.anything(),
    )
    expect(replaceMock.mock.calls[0][0]).not.toContain('storeId')
  })

  it('does not re-hydrate while the param lingers after clear()', () => {
    globalThis.__searchString__ = 'storeId=42'
    const { result, rerender } = renderHook(() => useStoreIdFilter(), {
      wrapper: createIsolatedWrapper(),
    })
    expect(result.current.storeId).toBe('42')

    // clear() strips the param via an async router.replace, so the next render
    // still sees ?storeId=42; the selection must stay cleared regardless.
    act(() => result.current.clear())
    rerender()

    expect(result.current.storeId).toBeNull()
  })

  it('does not re-hydrate on a remount while the param lingers after clear()', () => {
    globalThis.__searchString__ = 'storeId=42'
    const first = renderHook(() => useStoreIdFilter(), {
      wrapper: createIsolatedWrapper(),
    })
    expect(first.result.current.storeId).toBe('42')

    act(() => first.result.current.clear())
    // Param lingers (router.replace preempted); a fresh mount must not re-apply it.
    first.unmount()
    const second = renderHook(() => useStoreIdFilter(), {
      wrapper: createIsolatedWrapper(),
    })

    expect(second.result.current.storeId).toBeNull()
  })

  it('re-hydrates the same store when the param comes back', () => {
    globalThis.__searchString__ = 'storeId=42'
    const { result, rerender } = renderHook(() => useStoreIdFilter(), {
      wrapper: createIsolatedWrapper(),
    })
    expect(result.current.storeId).toBe('42')

    act(() => result.current.clear())
    globalThis.__searchString__ = ''
    rerender()
    expect(result.current.storeId).toBeNull()

    // Back button (or re-picking the same store) restores ?storeId=42.
    globalThis.__searchString__ = 'storeId=42'
    rerender()

    expect(result.current.storeId).toBe('42')
  })
})
