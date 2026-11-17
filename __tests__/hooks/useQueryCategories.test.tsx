import { renderHook } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useQueryCategories } from '@/hooks/useQueryCategories'
import {
  demoOptionsStore,
  queryCategorizationEnabledAtom,
} from '@/stores/demoOptions'

import type { ReactNode } from 'react'

const useInstantSearchMock = vi.fn()

vi.mock('react-instantsearch', () => {return {
  useInstantSearch: () => useInstantSearchMock(),
}})

const setCategories = (categories: unknown) => {
  useInstantSearchMock.mockReturnValue({
    results: { extensions: { queryCategorization: { categories } } },
  })
}

const renderUseQueryCategories = ({ enabled = true } = {}) => {
  demoOptionsStore.set(queryCategorizationEnabledAtom, enabled)

  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )

  return renderHook(() => useQueryCategories(), { wrapper })
}

describe('useQueryCategories', () => {
  beforeEach(() => {
    demoOptionsStore.set(queryCategorizationEnabledAtom, true)
    useInstantSearchMock.mockReset()
  })

  it('returns an empty array when the toggle is disabled, even if categories exist', () => {
    setCategories([
      {
        bin: 'very high',
        hierarchyPath: [
          { facetName: 'hierarchical_categories.lvl0', facetValue: 'Women', depth: 0 },
        ],
      },
    ])

    const { result } = renderUseQueryCategories({ enabled: false })

    expect(result.current).toEqual([])
  })

  it('returns an empty array when the queryCategorization extension is absent', () => {
    useInstantSearchMock.mockReturnValue({ results: {} })

    const { result } = renderUseQueryCategories()

    expect(result.current).toEqual([])
  })

  it('returns an empty array when the categories list is empty', () => {
    setCategories([])

    const { result } = renderUseQueryCategories()

    expect(result.current).toEqual([])
  })

  it('orders the path by depth, taking the shallowest as pathValue and the deepest as the label', () => {
    setCategories([
      {
        bin: 'very high',
        hierarchyPath: [
          { facetName: 'hierarchical_categories.lvl2', facetValue: 'Women > Clothing > Jackets', depth: 2 },
          { facetName: 'hierarchical_categories.lvl0', facetValue: 'Women', depth: 0 },
          { facetName: 'hierarchical_categories.lvl1', facetValue: 'Women > Clothing', depth: 1 },
        ],
      },
    ])

    const { result } = renderUseQueryCategories()

    expect(result.current).toEqual([
      {
        pathValue: 'Women',
        attributes: ['hierarchical_categories.lvl0', 'hierarchical_categories.lvl1', 'hierarchical_categories.lvl2'],
        label: 'Women > Clothing > Jackets',
        value: 'Women > Clothing > Jackets',
        bin: 'very high',
      },
    ])
  })

  it('dedupes hierarchy entries that share a facet name, keeping the deepest occurrence', () => {
    setCategories([
      {
        hierarchyPath: [
          { facetName: 'hierarchical_categories.lvl0', facetValue: 'Women', depth: 0 },
          { facetName: 'hierarchical_categories.lvl1', facetValue: 'Women > Clothing', depth: 1 },
          { facetName: 'hierarchical_categories.lvl1', facetValue: 'Women > Shoes', depth: 1 },
        ],
      },
    ])

    const { result } = renderUseQueryCategories()

    expect(result.current).toEqual([
      {
        pathValue: 'Women',
        attributes: ['hierarchical_categories.lvl0', 'hierarchical_categories.lvl1'],
        label: 'Women > Shoes',
        value: 'Women > Shoes',
        bin: undefined,
      },
    ])
  })

  it('drops categories with a missing or empty hierarchy path while keeping valid ones', () => {
    setCategories([
      { bin: 'low' },
      { bin: 'medium', hierarchyPath: [] },
      {
        bin: 'high',
        hierarchyPath: [
          { facetName: 'hierarchical_categories.lvl0', facetValue: 'Men', depth: 0 },
        ],
      },
    ])

    const { result } = renderUseQueryCategories()

    expect(result.current).toEqual([
      {
        pathValue: 'Men',
        attributes: ['hierarchical_categories.lvl0'],
        label: 'Men',
        value: 'Men',
        bin: 'high',
      },
    ])
  })

  it('returns a referentially stable array across re-renders when the category payload is unchanged', () => {
    setCategories([
      {
        hierarchyPath: [
          { facetName: 'hierarchical_categories.lvl0', facetValue: 'Women', depth: 0 },
        ],
      },
    ])

    const { result, rerender } = renderUseQueryCategories()
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })

  it('returns the same empty reference when disabled, avoiding new allocations', () => {
    setCategories([])

    const { result, rerender } = renderUseQueryCategories({ enabled: false })
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
    expect(result.current).toHaveLength(0)
  })
})
