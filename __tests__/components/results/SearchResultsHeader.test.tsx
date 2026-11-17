import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SearchResultsHeader } from '@/components/results/SearchResultsHeader'

const stats = { query: '', nbHits: 0 }

vi.mock('react-instantsearch', () => {
  return { useStats: () => stats }
})

describe('SearchResultsHeader', () => {
  beforeEach(() => {
    stats.query = ''
    stats.nbHits = 0
  })

  it('shows the label while there is no query', () => {
    render(<SearchResultsHeader label="TV Series" scope="TV Series" />)

    expect(
      screen.getByRole('heading', { name: 'TV Series' }),
    ).toBeInTheDocument()
  })

  it('names the scope in the query heading', () => {
    stats.query = 'batman'

    render(<SearchResultsHeader label="TV Series" scope="TV Series" />)

    expect(
      screen.getByRole('heading', { name: 'Results for "batman" in TV Series' }),
    ).toBeInTheDocument()
  })

  it('leaves the query heading unqualified without a scope', () => {
    stats.query = 'batman'

    render(<SearchResultsHeader label="Search" />)

    expect(
      screen.getByRole('heading', { name: 'Results for "batman"' }),
    ).toBeInTheDocument()
  })

  it('hides the result count unless asked for it', () => {
    stats.nbHits = 12

    render(<SearchResultsHeader label="Search" />)

    expect(screen.queryByText('12 results')).not.toBeInTheDocument()
  })

  it('shows the result count when asked', () => {
    stats.nbHits = 12

    render(<SearchResultsHeader label="Search" showResultCount />)

    expect(screen.getByText('12 results')).toBeInTheDocument()
  })

  it('lets a caller override the variant heading size', () => {
    render(<SearchResultsHeader label="Search" headingClassName="text-2xl" />)

    const heading = screen.getByRole('heading', { name: 'Search' })

    expect(heading.className).toContain('text-2xl')
    expect(heading.className).not.toContain('text-3xl')
  })
})
