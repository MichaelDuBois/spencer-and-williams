import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NoResultsRecovery } from '@/components/results/NoResultsRecovery'

const useNoResultsRecoveryStateMock = vi.hoisted(() => vi.fn())
const useActiveConfigMock = vi.hoisted(() => vi.fn())
const useProductHitDefinitionMock = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useNoResultsRecoveryState', () => {return {
  useNoResultsRecoveryState: useNoResultsRecoveryStateMock,
}})
vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: useActiveConfigMock,
}})
vi.mock('@/hooks/useProductHitDefinition', () => {return {
  useProductHitDefinition: useProductHitDefinitionMock,
}})
vi.mock('@/components/recommend/ProductRecommend', () => {return {
  ProductRecommend: () => <div>Recommended products</div>,
}})

const handleAssistant = vi.fn()
const handleClearFilters = vi.fn()
const handleSuggestion = vi.fn()

const buildState = (overrides: Record<string, unknown> = {}) => {return {
  query: 'red shoes',
  shouldRender: true,
  hasRefinements: false,
  hasAssistant: false,
  suggestionsTitle: undefined,
  suggestions: [],
  categoriesTitle: undefined,
  categories: [],
  handleAssistant,
  handleClearFilters,
  handleSuggestion,
  ...overrides,
}}

describe('NoResultsRecovery', () => {
  beforeEach(() => {
    handleAssistant.mockReset()
    handleClearFilters.mockReset()
    handleSuggestion.mockReset()
    useActiveConfigMock.mockReturnValue({ features: {} })
    useProductHitDefinitionMock.mockReturnValue({})
    useNoResultsRecoveryStateMock.mockReturnValue(buildState())
  })

  it('renders only the standard state without recovery configuration', () => {
    render(<NoResultsRecovery basePath="/shop" />)

    expect(screen.getByText('No results for "red shoes"')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ask the assistant' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders the shared assistant section when the capability is available', () => {
    useNoResultsRecoveryStateMock.mockReturnValue(
      buildState({
        hasAssistant: true,
      }),
    )

    render(<NoResultsRecovery basePath="/shop" />)
    fireEvent.click(screen.getByRole('button', { name: 'Ask the assistant' }))

    expect(screen.getByText('Need help finding it?')).toBeInTheDocument()
    expect(handleAssistant).toHaveBeenCalledOnce()
  })

  it('renders an independently configured suggestions section', () => {
    useNoResultsRecoveryStateMock.mockReturnValue(
      buildState({
        suggestionsTitle: 'Try another search',
        suggestions: ['running shoes'],
      }),
    )

    render(<NoResultsRecovery basePath="/shop" />)
    fireEvent.click(screen.getByRole('button', { name: 'running shoes' }))

    expect(screen.getByText('Try another search')).toBeInTheDocument()
    expect(handleSuggestion).toHaveBeenCalledWith('running shoes')
  })

  it('renders an independently configured categories section', () => {
    useNoResultsRecoveryStateMock.mockReturnValue(
      buildState({
        categoriesTitle: 'Browse departments',
        categories: [
          { label: 'Footwear', href: '/shop/category/shoes' },
        ],
      }),
    )

    render(<NoResultsRecovery basePath="/shop" />)

    expect(screen.getByText('Browse departments')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Footwear' })).toHaveAttribute(
      'href',
      '/shop/category/shoes',
    )
  })

  it('renders an independently configured recommendation section', () => {
    useActiveConfigMock.mockReturnValue({
      slug: 'shop',
      features: {
        recommend: {
          noResults: [{ model: 'trending-items', title: 'Trending' }],
        },
      },
    })
    useProductHitDefinitionMock.mockReturnValue({
      definition: { carouselVariant: 'standard' },
    })

    render(<NoResultsRecovery basePath="/shop" />)

    expect(screen.getByText('Recommended products')).toBeInTheDocument()
  })

  it('offers one clear-filters action for a filtered empty query', () => {
    useNoResultsRecoveryStateMock.mockReturnValue(
      buildState({ query: '', hasRefinements: true }),
    )

    render(<NoResultsRecovery basePath="/shop" />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(screen.getByRole('heading', { name: 'No results' })).toBeVisible()
    expect(handleClearFilters).toHaveBeenCalledOnce()
  })

  it('stays hidden until the recovery state is ready', () => {
    useNoResultsRecoveryStateMock.mockReturnValue(
      buildState({ shouldRender: false }),
    )

    render(<NoResultsRecovery basePath="/shop" />)

    expect(screen.queryByLabelText('Search recovery')).not.toBeInTheDocument()
  })
})
