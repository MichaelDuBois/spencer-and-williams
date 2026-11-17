import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import {
  isAIAssistantExpandedState,
  isAIAssistantOpenState,
} from '@/features/aiAssistant'
import { track } from '@/lib/analytics/track'
import { selectedMediaTitleAtom } from '@/stores/mediaEntertainment'
import { getMediaWatchStateAtom } from '@/stores/mediaWatchState'

import { createMediaRailItem } from '@/../__tests__/app/media-entertainment/_helpers/railFixtures'
import { buildJotaiWrapper, createTestStore } from '@tests/helpers/jotai-wrapper'
import { installMatchMedia } from '@tests/helpers/matchMedia'

/**
 * `vitest.setup.tsx`'s global `next/image` mock strips `fill`, `priority` **and
 * `sizes`** before spreading onto the `<img>`, so `sizes` is invisible to every
 * other test file. This file-local mock forwards it, which makes this the one
 * place that can assert the attribute.
 *
 * Deliberately the only such override in the suite: duplicating it across files
 * is how mocks rot out of sync with the real component.
 */
vi.mock('next/image', () => {
  return {
    default: ({
      fill: _fill,
      priority: _priority,
      ...rest
    }: Record<string, unknown>) => <img {...rest} />,
  }
})

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

const POSTER_SIZES =
  '(min-width: 1536px) 192px, (min-width: 1280px) 176px, (min-width: 1024px) 160px, (min-width: 768px) 144px, (min-width: 640px) 128px, 112px'

const BACKDROP_SIZES =
  '(min-width: 1280px) 384px, (min-width: 1024px) 352px, (min-width: 768px) 320px, (min-width: 640px) 288px, 256px'

const watchStateAtom = getMediaWatchStateAtom(mediaEntertainmentConfig.slug)

describe('MediaEntertainmentPosterCard', () => {
  beforeEach(() => {
    // The watch-state atom is module-cached and sessionStorage-backed, so a
    // toggle in one test would otherwise leak into the next.
    sessionStorage.clear()
  })

  // Back to the non-matching default `vitest.setup.tsx` installs, without
  // `unstubAllGlobals`, which would take the observer stubs with it.
  afterEach(() => installMatchMedia(false))

  it('links to the title detail page', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(
      screen.getByRole('link', { name: /Blade Runner 2049/ }),
    ).toHaveAttribute('href', '/media-entertainment/title/movie_1')
  })

  it('opens the detail sheet on a plain click', async () => {
    const user = userEvent.setup()
    const store = createTestStore()

    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />, {
      wrapper: buildJotaiWrapper(store),
    })

    await user.click(screen.getByRole('link', { name: /Blade Runner 2049/ }))

    expect(store.get(selectedMediaTitleAtom)?.objectID).toBe('movie_1')
  })

  it('closes the assistant below lg, where it has no docked width to shrink to', async () => {
    installMatchMedia(true)
    const user = userEvent.setup()
    const store = createTestStore((testStore) => {
      testStore.set(isAIAssistantOpenState, true)
    })

    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />, {
      wrapper: buildJotaiWrapper(store),
    })

    await user.click(screen.getByRole('link', { name: /Blade Runner 2049/ }))

    expect(store.get(isAIAssistantOpenState)).toBe(false)
    expect(store.get(selectedMediaTitleAtom)?.objectID).toBe('movie_1')
  })

  it('docks a fullscreen assistant, which would otherwise cover the sheet', async () => {
    const user = userEvent.setup()
    const store = createTestStore((testStore) => {
      testStore.set(isAIAssistantOpenState, true)
      testStore.set(isAIAssistantExpandedState, true)
    })

    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />, {
      wrapper: buildJotaiWrapper(store),
    })

    await user.click(screen.getByRole('link', { name: /Blade Runner 2049/ }))

    expect(store.get(isAIAssistantExpandedState)).toBe(false)
    expect(store.get(isAIAssistantOpenState)).toBe(true)
  })

  it('reports no assistant result click from a page poster', async () => {
    const user = userEvent.setup()
    vi.mocked(track).mockClear()

    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    await user.click(screen.getByRole('link', { name: /Blade Runner 2049/ }))

    expect(track).not.toHaveBeenCalledWith(
      'assistant_result_clicked',
      expect.anything(),
    )
  })

  it('leaves a cmd-click to the browser, so the route still opens in a tab', () => {
    const store = createTestStore()

    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />, {
      wrapper: buildJotaiWrapper(store),
    })

    const link = screen.getByRole('link', { name: /Blade Runner 2049/ })
    // jsdom cannot follow an href, so swallow the default. What is asserted is
    // that the card itself did not intercept the click.
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link, { metaKey: true })

    expect(store.get(selectedMediaTitleAtom)).toBeNull()
  })

  it('labels the artwork with the title', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(screen.getByAltText('Blade Runner 2049')).toBeInTheDocument()
  })

  it('renders the metadata in the DOM (the reveal itself is CSS)', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(
      screen.getByRole('heading', { name: 'Blade Runner 2049' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2017')).toBeInTheDocument()
    expect(screen.getByText('2h 44m')).toBeInTheDocument()
  })

  it('omits the runtime entirely when it is 0', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem({ runtime: 0, type: 'movie' })}
      />,
    )

    expect(screen.queryByText('0m')).not.toBeInTheDocument()
    expect(screen.queryByText('Series')).not.toBeInTheDocument()
    expect(screen.getByText('2017')).toBeInTheDocument()
  })

  it('labels a show with no runtime as "Series"', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem({ runtime: 0, type: 'show' })}
      />,
    )

    expect(screen.getByText('Series')).toBeInTheDocument()
  })

  it('passes the poster shape sizes string through to the image', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(screen.getByAltText('Blade Runner 2049')).toHaveAttribute(
      'sizes',
      POSTER_SIZES,
    )
  })

  it('passes the backdrop shape sizes string through to the image', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem()}
        shape="backdrop"
      />,
    )

    expect(screen.getByAltText('Blade Runner 2049')).toHaveAttribute(
      'sizes',
      BACKDROP_SIZES,
    )
  })

  it('lazy-loads every card', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(screen.getByAltText('Blade Runner 2049')).toHaveAttribute(
      'loading',
      'lazy',
    )
  })

  it('keeps the w500 poster derivative for the poster shape', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(screen.getByAltText('Blade Runner 2049')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w500/poster1.jpg',
    )
  })

  it('requests the w780 backdrop derivative for the backdrop shape', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem()}
        shape="backdrop"
      />,
    )

    expect(screen.getByAltText('Blade Runner 2049')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w780/backdrop1.jpg',
    )
  })

  it('requests the w780 poster derivative for the spotlight shape', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem()}
        shape="spotlight"
      />,
    )

    expect(screen.getByAltText('Blade Runner 2049')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w780/poster1.jpg',
    )
  })

  it('falls back to the poster when a backdrop-shape title has no backdrop', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem({ backdrop: undefined })}
        shape="backdrop"
      />,
    )

    expect(screen.getByAltText('Blade Runner 2049')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w780/poster1.jpg',
    )
  })

  it('shows the placeholder when the poster is missing', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem({ poster: undefined })}
      />,
    )

    expect(screen.queryByAltText('Blade Runner 2049')).not.toBeInTheDocument()
    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('shows the maturity rating and genres only at the full metadata density', () => {
    const { unmount } = render(
      <MediaEntertainmentPosterCard title={createMediaRailItem()} />,
    )

    // poster shape is 'minimal' — too narrow for a cert badge or genres.
    expect(screen.queryByText('R')).not.toBeInTheDocument()
    expect(screen.queryByText('Science Fiction')).not.toBeInTheDocument()
    unmount()

    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem()}
        shape="spotlight"
      />,
    )

    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText('Science Fiction')).toBeInTheDocument()
    // Capped at two, so the third genre is dropped.
    expect(screen.queryByText('Thriller')).not.toBeInTheDocument()
  })

  it('carries a My List toggle on every card (the reveal itself is CSS)', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(
      screen.getByRole('button', { name: 'Add Blade Runner 2049 to My List' }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('saves the title to the active profile and flips the control', async () => {
    const user = userEvent.setup()
    const store = createTestStore()

    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />, {
      wrapper: buildJotaiWrapper(store),
    })

    await user.click(
      screen.getByRole('button', { name: 'Add Blade Runner 2049 to My List' }),
    )

    expect(
      store.get(watchStateAtom).anonymous?.myList.map((entry) => entry.objectID),
    ).toEqual(['movie_1'])
    expect(
      screen.getByRole('button', {
        name: 'Remove Blade Runner 2049 from My List',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('leaves the detail sheet shut when the toggle is used', async () => {
    const user = userEvent.setup()
    const store = createTestStore()

    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />, {
      wrapper: buildJotaiWrapper(store),
    })

    await user.click(
      screen.getByRole('button', { name: 'Add Blade Runner 2049 to My List' }),
    )

    // The control sits on top of a card-wide link, which must not also fire.
    expect(store.get(selectedMediaTitleAtom)).toBeNull()
  })

  it('draws no progress bar unless a progress is passed', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('draws the progress bar at the passed percentage', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem()}
        progress={0.42}
      />,
    )

    const bar = screen.getByRole('progressbar', {
      name: 'Blade Runner 2049 watch progress',
    })
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(bar).toHaveStyle({ width: '42%' })
  })

  it('offers a dismiss control only where a handler is passed', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const { unmount } = render(
      <MediaEntertainmentPosterCard title={createMediaRailItem()} />,
    )

    expect(
      screen.queryByRole('button', { name: /from Continue Watching/ }),
    ).not.toBeInTheDocument()
    unmount()

    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem()}
        onRemove={onRemove}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Blade Runner 2049 from Continue Watching',
      }),
    )

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('flags an injected title outside the link, so it is announced', () => {
    render(
      <MediaEntertainmentPosterCard
        title={createMediaRailItem()}
        promotedLabel="Promoted"
      />,
    )

    const flag = screen.getByText('Promoted')

    expect(flag).toBeInTheDocument()
    expect(flag.closest('a')).toBeNull()
  })

  it('carries no flag for an organic title', () => {
    render(<MediaEntertainmentPosterCard title={createMediaRailItem()} />)

    expect(screen.queryByText('Promoted')).not.toBeInTheDocument()
  })
})
