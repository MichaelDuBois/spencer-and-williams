import { createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { MediaEntertainmentResultsGrid } from '@/app/media-entertainment/search/_components/MediaEntertainmentResultsGrid'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { VerticalConfig } from '@/types'

import { fireEvent, render, screen } from '@tests/helpers/test-utils'

const showMore = vi.fn()

const state: {
  items: Record<string, unknown>[]
  isLastPage: boolean
} = { items: [], isLastPage: false }

vi.mock('react-instantsearch', () => {
  return {
    useInfiniteHits: () => {
      return { items: state.items, isLastPage: state.isLastPage, showMore }
    },
  }
})

const titleHit = (objectID: string, title: string) => {
  return {
    objectID,
    title,
    record_type: 'movie',
    genres: ['Science Fiction'],
    release_date_str: '2017',
    runtime: 164,
    certification: 'R',
    poster_path: '/poster.jpg',
  }
}

const compositionId =
  mediaEntertainmentConfig.features.composition?.compositionId ?? ''

/** The shape a composition injection stamps onto an injected hit. */
const injected = (injectedItemKey: string) => {
  return {
    _rankingInfo: {
      composed: { [compositionId]: { index: 'media_ns', injectedItemKey } },
    },
  }
}

const renderGrid = () => {
  const store = createStore()
  store.set(
    activeConfigAtom,
    mediaEntertainmentConfig as unknown as VerticalConfig,
  )

  return render(<MediaEntertainmentResultsGrid />, { store })
}

describe('MediaEntertainmentResultsGrid', () => {
  beforeEach(() => {
    showMore.mockReset()
    state.items = [
      titleHit('movie_1', 'Blade Runner 2049'),
      titleHit('movie_2', 'Arrival'),
      titleHit('movie_3', 'Dune'),
    ]
    state.isLastPage = false
  })

  it('renders one card per hit', () => {
    renderGrid()

    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('names each card after its title and links to the title page', () => {
    renderGrid()

    expect(
      screen.getByRole('link', { name: 'Blade Runner 2049' }),
    ).toHaveAttribute('href', '/media-entertainment/title/movie_1')
  })

  it('renders nothing when there are no hits', () => {
    state.items = []

    const { container } = renderGrid()

    expect(container).toBeEmptyDOMElement()
  })

  it('pages with a button rather than a scroll sentinel', () => {
    renderGrid()

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))

    expect(showMore).toHaveBeenCalledTimes(1)
  })

  it('hides the load-more button on the last page', () => {
    state.isLastPage = true

    renderGrid()

    expect(screen.getAllByRole('link')).toHaveLength(3)
    expect(
      screen.queryByRole('button', { name: 'Load more' }),
    ).not.toBeInTheDocument()
  })

  it('flags a title the composition injected', () => {
    state.items = [
      { ...titleHit('movie_1', 'Blade Runner 2049'), ...injected('promoted') },
      titleHit('movie_2', 'Arrival'),
    ]

    renderGrid()

    expect(screen.getAllByText('Promoted')).toHaveLength(1)
  })

  it('labels the injection by its key rather than always "Promoted"', () => {
    state.items = [
      { ...titleHit('movie_1', 'Dune'), ...injected('sponsored-warner') },
    ]

    renderGrid()

    expect(screen.getByText('Sponsored')).toBeInTheDocument()
  })

  it('leaves an organic result unflagged', () => {
    renderGrid()

    expect(screen.queryByText('Promoted')).not.toBeInTheDocument()
  })
})
