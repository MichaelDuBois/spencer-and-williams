import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ArticlesSearchPage } from '@/app/travel/search/articles/_components/ArticlesSearchPage'

vi.mock('@/features/chatWidget/components/ChatSearchOverview', () => {
  return {
    ChatSearchOverview: () => <div>Overview</div>,
  }
})
vi.mock('react-instantsearch', () => {
  return {
    Configure: () => null,
    Hits: () => <div>Results</div>,
    useStats: () => {
      return { nbHits: 3, query: 'best hiking trip' }
    },
  }
})
vi.mock('next/link', () => {
  return {
    default: ({
      children,
      href,
    }: {
      children: React.ReactNode
      href: string
    }) => <a href={href}>{children}</a>,
  }
})
vi.mock('@/hooks/useHrefWithQueryString', () => {
  return {
    useHrefWithQueryString: () => (path: string) =>
      `${path}?query=best+hiking+trip`,
  }
})
vi.mock('@/components/filters/ClearAllButton', () => {
  return { ClearAllButton: () => null }
})
vi.mock('@/components/filters/CurrentRefinements', () => {
  return { CurrentRefinements: () => null }
})
vi.mock('@/components/filters/FacetFilters', () => {
  return { FacetFilters: () => null }
})
vi.mock('@/components/pagination/Pagination', () => {
  return { Pagination: () => null }
})
vi.mock('@/components/results/FilterSuggestionsWidget', () => {
  return { FilterSuggestionsWidget: () => null }
})

describe('ArticlesSearchPage', () => {
  it('shows overview on the dedicated article page and preserves the query in the back link', () => {
    render(<ArticlesSearchPage />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All results' })).toHaveAttribute(
      'href',
      '/travel/search?query=best+hiking+trip',
    )
  })
})
