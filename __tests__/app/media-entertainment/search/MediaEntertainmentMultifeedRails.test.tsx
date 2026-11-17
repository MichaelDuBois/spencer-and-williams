import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentMultifeedRails } from '@/app/media-entertainment/search/_components/MediaEntertainmentMultifeedRails'
import { useMultifeedComposition } from '@/hooks/useMultifeedComposition'
import type { MultifeedCompositionResult } from '@/lib/multifeed-composition'

vi.mock('@/hooks/useMultifeedComposition', () => {
  return { useMultifeedComposition: vi.fn() }
})

const mockedUseMultifeedComposition = vi.mocked(useMultifeedComposition)

const setFeeds = (data: MultifeedCompositionResult[] | undefined) => {
  mockedUseMultifeedComposition.mockReturnValue({ data } as ReturnType<
    typeof useMultifeedComposition
  >)
}

const hit = (objectID: string, title: string) => {
  return { objectID, title, __position: 1, __queryID: 'q-1' }
}

const STAR_WARS_FEEDS: MultifeedCompositionResult[] = [
  {
    feedId: 'Star Wars Series',
    title: 'Star Wars Series',
    indexName: 'media_ns',
    hits: [hit('show_1', 'The Mandalorian')],
  },
  {
    feedId: 'Star Wars Movies',
    title: 'Star Wars Movies',
    indexName: 'media_ns',
    hits: [hit('movie_1', 'A New Hope')],
  },
]

describe('MediaEntertainmentMultifeedRails', () => {
  beforeEach(() => {
    mockedUseMultifeedComposition.mockReset()
  })

  it('renders one rail per feed, titled by the feed', () => {
    setFeeds(STAR_WARS_FEEDS)

    render(<MediaEntertainmentMultifeedRails />)

    expect(
      screen.getByRole('heading', { name: 'Star Wars Series' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Star Wars Movies' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'The Mandalorian' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'A New Hope' })).toBeInTheDocument()
  })

  it('asks the hook for main feeds, the genres facet and to keep previous feeds', () => {
    setFeeds(STAR_WARS_FEEDS)

    render(<MediaEntertainmentMultifeedRails />)

    expect(useMultifeedComposition).toHaveBeenCalledWith({
      includeMainFeeds: true,
      forwardFacets: ['genres'],
      keepPreviousData: true,
    })
  })

  it('renders nothing when no rule fired', () => {
    setFeeds([])

    const { container } = render(<MediaEntertainmentMultifeedRails />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing while composition is off', () => {
    setFeeds(undefined)

    const { container } = render(<MediaEntertainmentMultifeedRails />)

    expect(container).toBeEmptyDOMElement()
  })
})
