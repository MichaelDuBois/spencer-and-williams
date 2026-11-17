import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useNoResultsRecoveryState } from '@/hooks/useNoResultsRecoveryState'

const useActiveConfigMock = vi.hoisted(() => vi.fn())
const useNoResultsAssistantMock = vi.hoisted(() => vi.fn())
const useNoResultsRecoveryMock = vi.hoisted(() => vi.fn())
const useProductHitDefinitionMock = vi.hoisted(() => vi.fn())
const useInstantSearchMock = vi.hoisted(() => vi.fn())
const useSearchBoxMock = vi.hoisted(() => vi.fn())
const useStatsMock = vi.hoisted(() => vi.fn())
const useCurrentRefinementsMock = vi.hoisted(() => vi.fn())
const useClearRefinementsMock = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: useActiveConfigMock,
}})
vi.mock('@/hooks/useNoResultsAssistant', () => {return {
  useNoResultsAssistant: useNoResultsAssistantMock,
}})
vi.mock('@/hooks/useNoResultsRecovery', () => {return {
  useNoResultsRecovery: useNoResultsRecoveryMock,
}})
vi.mock('@/hooks/useProductHitDefinition', () => {return {
  useProductHitDefinition: useProductHitDefinitionMock,
}})
vi.mock('react-instantsearch', () => {return {
  useInstantSearch: useInstantSearchMock,
  useSearchBox: useSearchBoxMock,
  useStats: useStatsMock,
  useCurrentRefinements: useCurrentRefinementsMock,
  useClearRefinements: useClearRefinementsMock,
}})

const refine = vi.fn()
const clearRefinements = vi.fn()
const handleAssistant = vi.fn()

describe('useNoResultsRecoveryState', () => {
  beforeEach(() => {
    refine.mockReset()
    clearRefinements.mockReset()
    handleAssistant.mockReset()
    useActiveConfigMock.mockReturnValue({
      slug: 'shop',
      features: { agentStudio: { shoppingAssistantAgentID: 'assistant' } },
      algolia: {
        primaryIndex: {
          name: 'products',
          facets: [
            {
              attribute: ['categories.lvl0', 'categories.lvl1'],
              label: 'Category',
              type: 'hierarchical',
            },
          ],
        },
        indices: { querySuggestions: { name: 'suggestions' } },
      },
      navigation: [{ category: 'Shoes', label: 'Footwear' }],
    })
    useNoResultsAssistantMock.mockReturnValue({
      hasAssistant: true,
      handleAssistant,
    })
    useNoResultsRecoveryMock.mockReturnValue({
      data: { suggestions: ['running shoes'], categories: ['Shoes'] },
    })
    useProductHitDefinitionMock.mockReturnValue({})
    useInstantSearchMock.mockReturnValue({
      status: 'idle',
      results: { __isArtificial: false },
    })
    useSearchBoxMock.mockReturnValue({ query: 'red shoes', refine })
    useStatsMock.mockReturnValue({ nbHits: 0 })
    useCurrentRefinementsMock.mockReturnValue({ items: [] })
    useClearRefinementsMock.mockReturnValue({ refine: clearRefinements })
  })

  it('derives each section from the available vertical capabilities', () => {
    const { result } = renderHook(() =>
      useNoResultsRecoveryState({ basePath: '/shop' }),
    )

    expect(useNoResultsRecoveryMock).toHaveBeenCalledWith({
      query: 'red shoes',
      enabled: true,
      suggestionsLimit: 3,
      categoriesLimit: 4,
      enableSuggestions: true,
      enableCategories: true,
      categoryFilters: undefined,
    })
    expect(result.current).toEqual(
      expect.objectContaining({
        shouldRender: true,
        hasAssistant: true,
        suggestionsTitle: 'Try a different search',
        suggestions: ['running shoes'],
        categoriesTitle: 'Browse popular categories',
        categories: [
          { label: 'Footwear', href: '/shop/category/shoes' },
        ],
      }),
    )
  })

  it.each([
    [
      'assistant',
      { features: { agentStudio: { shoppingAssistantAgentID: 'assistant' } } },
      true,
      {
        hasAssistant: true,
        suggestionsTitle: undefined,
        categoriesTitle: undefined,
      },
    ],
    [
      'suggestions',
      {
        features: {},
        algolia: {
          primaryIndex: { name: 'products', facets: [] },
          indices: { querySuggestions: { name: 'suggestions' } },
        },
      },
      false,
      {
        hasAssistant: false,
        suggestionsTitle: 'Try a different search',
        categoriesTitle: undefined,
      },
    ],
    [
      'categories',
      {
        features: {},
        algolia: {
          primaryIndex: {
            name: 'products',
            facets: [
              {
                attribute: 'category',
                label: 'Category',
                type: 'hierarchical',
              },
            ],
          },
          indices: {},
        },
      },
      false,
      {
        hasAssistant: false,
        suggestionsTitle: undefined,
        categoriesTitle: 'Browse popular categories',
      },
    ],
  ])(
    'enables only the available %s capability',
    (_, verticalConfig, hasAssistant, expected) => {
      useActiveConfigMock.mockReturnValue({
        slug: 'shop',
        ...verticalConfig,
      })
      useNoResultsAssistantMock.mockReturnValue({
        hasAssistant,
        handleAssistant,
      })

      const { result } = renderHook(() =>
        useNoResultsRecoveryState({ basePath: '/shop' }),
      )

      expect(result.current).toEqual(expect.objectContaining(expected))
    },
  )

  it('keeps clear filters available for an empty-query zero-hit state', () => {
    useSearchBoxMock.mockReturnValue({ query: '', refine })
    useCurrentRefinementsMock.mockReturnValue({
      items: [{ refinements: [{ value: 'Acme' }] }],
    })

    const { result } = renderHook(() =>
      useNoResultsRecoveryState({ basePath: '/shop' }),
    )

    expect(result.current.shouldRender).toBe(true)
    expect(result.current.hasRefinements).toBe(true)
    expect(result.current.hasAssistant).toBe(false)
    expect(result.current.suggestions).toEqual([])
    expect(result.current.categories).toEqual([])
    result.current.handleClearFilters()
    expect(clearRefinements).toHaveBeenCalledOnce()
  })

  it.each([
    { status: 'loading', results: { __isArtificial: false } },
    { status: 'idle', results: { __isArtificial: true } },
  ])('stays hidden before results settle: $status', (instantSearchState) => {
    useInstantSearchMock.mockReturnValue(instantSearchState)

    const { result } = renderHook(() =>
      useNoResultsRecoveryState({ basePath: '/shop' }),
    )

    expect(result.current.shouldRender).toBe(false)
  })
})
