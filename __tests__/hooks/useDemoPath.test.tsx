import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useDemoPath } from '@/hooks/useDemoPath'

const usePathnameMock = vi.fn()

vi.mock('next/navigation', () => {return {
  usePathname: () => usePathnameMock(),
}})

describe('useDemoPath', () => {
  it('returns the first path segment as the vertical', () => {
    usePathnameMock.mockReturnValue('/ecommerce/search')
    expect(renderHook(() => useDemoPath()).result.current).toBe('ecommerce')
  })

  it('reads the segment regardless of deeper paths', () => {
    usePathnameMock.mockReturnValue('/fashion/product/123')
    expect(renderHook(() => useDemoPath()).result.current).toBe('fashion')
  })
})
