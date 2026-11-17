import { renderHook } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'

import { useB2BVisibilityFacet } from '@/app/b2b-warehouse/_hooks/useB2BVisibilityFacet'

const clearVisibility = vi.fn()
const state = {
  items: [] as { value: string; isRefined: boolean }[],
  canClear: false,
}

vi.mock('react-instantsearch', () => {return {
  useRefinementList: () => {return { items: state.items, refine: vi.fn() }},
  useClearRefinements: () => {return {
    canRefine: state.canClear,
    refine: clearVisibility,
  }},
}})

beforeEach(() => {
  state.items = []
  state.canClear = false
  clearVisibility.mockClear()
})

it('uses configured labels and the indexed value despite different casing', () => {
  state.items = [{ value: 'CUSTOMER_GROUP_0', isRefined: true }]

  const { result } = renderHook(() => useB2BVisibilityFacet(null))

  expect(result.current.groups[0]).toMatchObject({
    label: 'Customer Group 0',
    description: '15% group discount',
    isSelected: true,
    refinementValue: 'CUSTOMER_GROUP_0',
  })
})

it('clears visitor refinements when a persona locks visibility', () => {
  state.canClear = true

  renderHook(() => useB2BVisibilityFacet('customer_group_0'))

  expect(clearVisibility).toHaveBeenCalledOnce()
})
