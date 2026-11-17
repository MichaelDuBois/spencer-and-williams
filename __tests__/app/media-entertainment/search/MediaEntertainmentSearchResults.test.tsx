import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentSearchResults } from '@/app/media-entertainment/search/_components/MediaEntertainmentSearchResults'

const stats = { query: '', nbHits: 100 }
const search = { status: 'idle' }

vi.mock('react-instantsearch', () => {
  return {
    Configure: () => null,
    useStats: () => stats,
    useInstantSearch: () => search,
  }
})

vi.mock('@/hooks/useScrollToTop', () => {
  return { useScrollToTop: () => undefined }
})

vi.mock('@/components/results/SearchResultsHeader', () => {
  return {
    SearchResultsHeader: (props: Record<string, unknown>) => (
      <div data-testid="header" data-props={JSON.stringify(props)} />
    ),
  }
})

vi.mock(
  '@/app/media-entertainment/search/_components/MediaEntertainmentFilterChips',
  () => {
    return {
      MediaEntertainmentFilterChips: () => <div data-testid="chips" />,
    }
  },
)

vi.mock(
  '@/app/media-entertainment/search/_components/MediaEntertainmentResultsGrid',
  () => {
    return {
      MediaEntertainmentResultsGrid: () => <div data-testid="grid" />,
    }
  },
)

vi.mock(
  '@/app/media-entertainment/search/_components/MediaEntertainmentMultifeedRails',
  () => {
    return {
      MediaEntertainmentMultifeedRails: () => <div data-testid="rails" />,
    }
  },
)

vi.mock(
  '@/app/media-entertainment/search/_components/MediaEntertainmentNoResults',
  () => {
    return { MediaEntertainmentNoResults: () => <div data-testid="empty" /> }
  },
)

const headerProps = () =>
  JSON.parse(screen.getByTestId('header').dataset.props ?? '{}')

describe('MediaEntertainmentSearchResults', () => {
  beforeEach(() => {
    stats.query = ''
    stats.nbHits = 100
    search.status = 'idle'
  })

  it('heads the catalogue-wide page with Search and always counts', () => {
    render(<MediaEntertainmentSearchResults />)

    expect(headerProps()).toMatchObject({
      label: 'Search',
      showResultCount: true,
    })
    expect(headerProps().scope).toBeUndefined()
  })

  it('heads a section with its title and passes it as the scope', () => {
    render(<MediaEntertainmentSearchResults scope="TV Series" />)

    expect(headerProps()).toMatchObject({
      label: 'TV Series',
      scope: 'TV Series',
    })
  })

  it('holds back a section count until there is a query to count against', () => {
    render(<MediaEntertainmentSearchResults scope="Movies" />)

    expect(headerProps().showResultCount).toBe(false)
  })

  it('counts a section once a query narrows it', () => {
    stats.query = 'batman'

    render(<MediaEntertainmentSearchResults scope="Movies" />)

    expect(headerProps().showResultCount).toBe(true)
  })

  it('falls back to the empty state once a settled search returns nothing', () => {
    stats.nbHits = 0

    render(<MediaEntertainmentSearchResults scope="Movies" />)

    expect(screen.getByTestId('empty')).toBeInTheDocument()
    expect(screen.queryByTestId('grid')).not.toBeInTheDocument()
  })

  it('keeps the grid up while a search is still in flight', () => {
    stats.nbHits = 0
    search.status = 'loading'

    render(<MediaEntertainmentSearchResults />)

    expect(screen.getByTestId('grid')).toBeInTheDocument()
    expect(screen.queryByTestId('empty')).not.toBeInTheDocument()
  })

  it('does not mount the rails on a section route', () => {
    const { unmount } = render(<MediaEntertainmentSearchResults scope="Movies" />)

    expect(screen.queryByTestId('rails')).not.toBeInTheDocument()

    unmount()
    render(<MediaEntertainmentSearchResults />)

    expect(screen.getByTestId('rails')).toBeInTheDocument()
  })

  it('puts the rails above the header and chips, which sit on the grid', () => {
    render(<MediaEntertainmentSearchResults />)

    const order = ['rails', 'header', 'chips', 'grid'].map((id) =>
      screen.getByTestId(id),
    )
    order.slice(1).forEach((node, index) => {
      expect(
        order[index].compareDocumentPosition(node) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    })
  })
})
