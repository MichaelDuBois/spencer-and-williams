import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useProductHitDefinition } from '@/hooks/useProductHitDefinition'

const queryOptions = {
  filters: 'visible_by:group-a',
  ruleContexts: ['group-a'],
}

vi.mock(
  '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions',
  () => {return {
    useB2BProductHitOptions: () => queryOptions,
  }},
)

describe('useProductHitDefinition', () => {
  it('returns the registered B2B renderer and scoped query options', () => {
    const { result } = renderHook(() =>
      useProductHitDefinition('b2b-warehouse'),
    )

    expect(result.current.definition).toEqual(
      expect.objectContaining({
        variant: 'b2b-warehouse',
        carouselVariant: 'standard',
        usesScopedQueryOptions: true,
      }),
    )
    expect(result.current.queryOptions).toBe(queryOptions)
  })

  it('returns an unscoped registered commerce renderer', () => {
    const { result } = renderHook(() => useProductHitDefinition('fashion'))

    expect(result.current.definition).toEqual(
      expect.objectContaining({
        variant: 'editorial',
        carouselVariant: 'editorial',
      }),
    )
    expect(result.current.queryOptions).toBeUndefined()
  })

  it('safely rejects an unsupported slug', () => {
    const { result } = renderHook(() => useProductHitDefinition('unknown'))

    expect(result.current).toEqual({
      definition: undefined,
      queryOptions: undefined,
    })
  })
})
