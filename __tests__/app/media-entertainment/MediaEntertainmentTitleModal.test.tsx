import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentTitleModal } from '@/app/media-entertainment/_components/MediaEntertainmentTitleModal'
import { SIMILAR_TITLES_LIMIT } from '@/app/media-entertainment/_hooks/useMediaSimilarTitles'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'
import { activeConfigAtom } from '@/stores/activeConfig'
import { selectedMediaTitleAtom } from '@/stores/mediaEntertainment'
import { getMediaWatchStateAtom } from '@/stores/mediaWatchState'
import { baseSearchClientAtom, searchClientAtom } from '@/stores/searchClient'
import type { VerticalConfig } from '@/types'

import { createMediaRailItem } from '@tests/app/media-entertainment/_helpers/railFixtures'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

vi.mock('@/hooks/usePersonalization', () => {
  return {
    useCurrentUserToken: () => '',
    usePersonalization: () => {
      return {
        currentUserToken: '',
        currentOptionalFilters: [],
        mode: 'anonymous',
      }
    },
  }
})
vi.mock('search-insights', () => {
  return { default: vi.fn() }
})

/** The record the sheet fetches on open — everything the rails do not request. */
const DETAIL_HIT = {
  objectID: 'movie_1',
  title: 'Blade Runner 2049',
  record_type: 'movie',
  tagline: 'There is an order to things.',
  overview: 'A young blade runner uncovers a long-buried secret.',
  genres: ['Science Fiction', 'Drama', 'Thriller'],
  release_date_str: '2017',
  runtime: 164,
  certification: 'R',
  vote_average: 7.876,
  vote_count: 12345,
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  cast: [{ name: 'Ryan Gosling', character: 'K', profile_path: '/rg.jpg' }],
  directors: [{ name: 'Denis Villeneuve' }],
}

/** A raw record as Recommend returns it for the "Similar titles" row. */
const recommendHit = (index: number) => {
  return {
    objectID: `movie_${index + 1}`,
    title: `Similar ${index}`,
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
  }
}

// The by-objectID detail fetch is the only search the sheet runs; anything else
// reaching this mock is a regression, and an empty response makes it visible.
const searchMock = vi.fn(
  async (requests: { params: { hitsPerPage: number; filters?: string } }[]) => {
    const isDetail = requests[0]?.params.filters?.startsWith('objectID:')

    return { results: [{ hits: isDetail ? [DETAIL_HIT] : [] }] }
  },
)

const recommendMock = vi.fn().mockResolvedValue({ results: [] })

const renderSheet = (
  selected: MediaEntertainmentTitleHitValues | null = createMediaRailItem(),
) => {
  const store = createTestStore((testStore) => {
    const client = createMockSearchClient({
      search: searchMock,
      getRecommendations: recommendMock,
    })

    // Detail and fallback read the base client; Recommend reads the active one.
    testStore.set(baseSearchClientAtom, client)
    testStore.set(searchClientAtom, client)
    testStore.set(
      activeConfigAtom,
      mediaEntertainmentConfig as unknown as VerticalConfig,
    )
    testStore.set(selectedMediaTitleAtom, selected)
  })

  render(<MediaEntertainmentTitleModal />, {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })

  return store
}

describe('MediaEntertainmentTitleModal', () => {
  beforeEach(() => {
    searchMock.mockClear()
    recommendMock.mockClear()
    recommendMock.mockResolvedValue({ results: [] })
    // The watch-state atom is module-cached and sessionStorage-backed, so a Play
    // in one test would otherwise carry its progress into the next.
    sessionStorage.clear()
  })

  it('renders nothing while no title is selected', () => {
    renderSheet(null)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('names the dialog after the title', async () => {
    renderSheet()

    expect(
      await screen.findByRole('dialog', { name: 'Blade Runner 2049' }),
    ).toBeInTheDocument()
  })

  it('paints the card metadata before the full record lands', () => {
    renderSheet()

    expect(screen.getByText('2017')).toBeInTheDocument()
    expect(screen.getByText('2h 44m')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
  })

  it('fills in the synopsis, votes, genres and director from the record', async () => {
    renderSheet()

    expect(
      await screen.findByText(/A young blade runner uncovers/),
    ).toBeInTheDocument()
    expect(screen.getByText('7.9')).toBeInTheDocument()
    expect(screen.getByText('(12,345)')).toBeInTheDocument()
    expect(
      screen.getByText('Science Fiction, Drama, Thriller'),
    ).toBeInTheDocument()
    expect(screen.getByText('Denis Villeneuve')).toBeInTheDocument()
  })

  it('links a cast portrait at that person as a query', async () => {
    renderSheet()

    expect(await screen.findByRole('link', { name: 'Ryan Gosling' })).toHaveAttribute(
      'href',
      '/media-entertainment/search?query=Ryan%20Gosling',
    )
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('marks the title in progress and closes when Play is pressed', async () => {
    const user = userEvent.setup()
    const store = renderSheet()

    await user.click(screen.getByRole('button', { name: 'Play' }))

    expect(
      store.get(getMediaWatchStateAtom(mediaEntertainmentConfig.slug)).anonymous
        ?.continueWatching,
    ).toEqual([
      { objectID: 'movie_1', addedAt: expect.any(Number), progress: 0.06 },
    ])
    expect(store.get(selectedMediaTitleAtom)).toBeNull()
  })

  it('saves the title to My List from the sheet', async () => {
    const user = userEvent.setup()
    const store = renderSheet()

    await user.click(
      screen.getByRole('button', {
        name: 'Add Blade Runner 2049 to My List',
      }),
    )

    expect(
      store.get(getMediaWatchStateAtom(mediaEntertainmentConfig.slug)).anonymous
        ?.myList,
    ).toEqual([{ objectID: 'movie_1', addedAt: expect.any(Number) }])
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const store = renderSheet()

    await user.keyboard('{Escape}')

    expect(store.get(selectedMediaTitleAtom)).toBeNull()
  })

  it('closes on the close button', async () => {
    const user = userEvent.setup()
    const store = renderSheet()

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(store.get(selectedMediaTitleAtom)).toBeNull()
  })

  it('closes on a click outside the sheet but not inside it', async () => {
    const store = renderSheet()
    const sheet = screen.getByRole('dialog')

    fireEvent.click(sheet)
    expect(store.get(selectedMediaTitleAtom)).not.toBeNull()

    fireEvent.click(sheet.parentElement!)
    expect(store.get(selectedMediaTitleAtom)).toBeNull()
  })

  it('takes focus without scrolling the entrance offset away', async () => {
    // A plain focus() scrolls the sheet's 100vh offset off before Motion animates it.
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')

    renderSheet()
    const sheet = await screen.findByRole('dialog')

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
    expect(focusSpy.mock.contexts).toContain(sheet)

    focusSpy.mockRestore()
  })

  describe('similar titles', () => {
    const rowLabels = (): (string | null)[] => {
      const heading = screen.queryByRole('heading', { name: 'Similar titles' })

      if (!heading) return []

      return within(heading.closest('section')!)
        .queryAllByRole('link')
        .map((link) => link.getAttribute('aria-label'))
    }

    it('fills the row from Recommend, in the order it returns', async () => {
      recommendMock.mockResolvedValue({
        results: [{ hits: [1, 2, 3].map(recommendHit) }],
      })

      renderSheet()

      await waitFor(() =>
        expect(rowLabels()).toEqual(['Similar 1', 'Similar 2', 'Similar 3']),
      )
    })

    it('says so when Recommend has no related titles', async () => {
      recommendMock.mockResolvedValue({ results: [{ hits: [] }] })

      renderSheet()

      expect(
        await screen.findByText('No similar titles for this one yet.'),
      ).toBeInTheDocument()
      // The heading stays: the row states the miss instead of vanishing.
      expect(
        screen.getByRole('heading', { name: 'Similar titles' }),
      ).toBeInTheDocument()
      expect(rowLabels()).toEqual([])
    })

    it('never tops the row up with a catalogue search', async () => {
      recommendMock.mockResolvedValue({ results: [{ hits: [] }] })

      renderSheet()

      await screen.findByText('No similar titles for this one yet.')

      // The by-objectID detail fetch is the only search the sheet may run.
      const filters = searchMock.mock.calls.map(
        ([requests]) => requests[0].params.filters,
      )
      expect(filters).toEqual(['objectID:"movie_1"'])
    })

    it('keeps the open title out of the row', async () => {
      // `recommendHit(0)` is movie_1 — the title the sheet is showing.
      recommendMock.mockResolvedValue({
        results: [{ hits: [0, 1, 2].map(recommendHit) }],
      })

      renderSheet()

      await waitFor(() =>
        expect(rowLabels()).toEqual(['Similar 1', 'Similar 2']),
      )
    })

    it('caps the row at the grid limit', async () => {
      recommendMock.mockResolvedValue({
        results: [
          { hits: Array.from({ length: 20 }, (_, index) => recommendHit(index + 1)) },
        ],
      })

      renderSheet()

      await waitFor(() =>
        expect(rowLabels()).toHaveLength(SIMILAR_TITLES_LIMIT),
      )
    })

    it('swaps the sheet to the title picked from the row', async () => {
      recommendMock.mockResolvedValue({
        results: [{ hits: [recommendHit(1)] }],
      })
      const user = userEvent.setup()
      const store = renderSheet()

      await user.click(await screen.findByRole('link', { name: 'Similar 1' }))

      await waitFor(() =>
        expect(store.get(selectedMediaTitleAtom)?.objectID).toBe('movie_2'),
      )
    })
  })
})
