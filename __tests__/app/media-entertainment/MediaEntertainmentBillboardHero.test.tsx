import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentBillboardHero } from '@/app/media-entertainment/_components/MediaEntertainmentBillboardHero'
import { DEFAULT_ROTATION_INTERVAL_MS } from '@/app/media-entertainment/_hooks/useBillboardRotation'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { selectedMediaTitleAtom } from '@/stores/mediaEntertainment'
import { getMediaWatchStateAtom } from '@/stores/mediaWatchState'

import {
  createMediaRailItem,
  createMediaRailItems,
} from '@tests/app/media-entertainment/_helpers/railFixtures'
import { createTestStore, buildJotaiWrapper } from '@tests/helpers/jotai-wrapper'
import { installMatchMedia } from '@tests/helpers/matchMedia'


/**
 * `installMatchMedia(true)` makes `(prefers-reduced-motion: reduce)` match, which
 * switches the rotation hook's automatic interval off. That keeps every assertion
 * here about *what the hero renders* rather than about when a timer fires — the
 * timing itself is `useBillboardRotation`'s own test — and `goTo` still works, so
 * the indicator buttons are fully exercised.
 */
const SLUG = mediaEntertainmentConfig.slug

describe('MediaEntertainmentBillboardHero', () => {
  // Deliberately no `vi.unstubAllGlobals()`: `vitest.setup.tsx` installs the
  // IntersectionObserver stub through `vi.stubGlobal` as well, so unstubbing all
  // would take it down with matchMedia and every `next/link` in this tree would
  // throw on mount. The jsdom environment is per file, and re-installing
  // matchMedia before each test is all the isolation this needs.
  // The watch-state atom is module-cached and sessionStorage-backed, so a Play in
  // one test would otherwise carry its progress into the next.
  beforeEach(() => {
    installMatchMedia(true)
    sessionStorage.clear()
  })

  it('renders nothing for an empty title list', () => {
    const { container } = render(
      <MediaEntertainmentBillboardHero titles={[]} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders the active title as the page heading', () => {
    render(
      <MediaEntertainmentBillboardHero titles={[createMediaRailItem()]} />,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Blade Runner 2049',
    )
  })

  it('renders the certification badge, year and runtime', () => {
    render(
      <MediaEntertainmentBillboardHero titles={[createMediaRailItem()]} />,
    )

    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText('2017')).toBeInTheDocument()
    expect(screen.getByText('2h 44m')).toBeInTheDocument()
  })

  it('omits the runtime entirely when it is 0 rather than rendering "0m"', () => {
    render(
      <MediaEntertainmentBillboardHero
        titles={[createMediaRailItem({ runtime: 0, type: 'movie' })]}
      />,
    )

    expect(screen.queryByText('0m')).not.toBeInTheDocument()
    expect(screen.queryByText('Series')).not.toBeInTheDocument()
    expect(screen.getByText('2017')).toBeInTheDocument()
  })

  it('labels a show with no runtime as "Series"', () => {
    render(
      <MediaEntertainmentBillboardHero
        titles={[createMediaRailItem({ runtime: 0, type: 'show' })]}
      />,
    )

    expect(screen.getByText('Series')).toBeInTheDocument()
  })

  it('renders one indicator per title and marks the active one', () => {
    render(
      <MediaEntertainmentBillboardHero titles={createMediaRailItems(4)} />,
    )

    const indicators = screen.getAllByRole('button', { name: /^Show / })

    expect(indicators).toHaveLength(4)
    expect(indicators[0]).toHaveAttribute('aria-current', 'true')
    expect(indicators[1]).toHaveAttribute('aria-current', 'false')
    expect(indicators[3]).toHaveAttribute('aria-current', 'false')
  })

  it('swaps the displayed title when an indicator is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MediaEntertainmentBillboardHero titles={createMediaRailItems(3)} />,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Title 1',
    )

    await user.click(screen.getByRole('button', { name: 'Show Title 2' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Title 2',
      ),
    )
    expect(
      screen.getByRole('button', { name: 'Show Title 2' }),
    ).toHaveAttribute('aria-current', 'true')
  })

  it('mounts only the active backdrop and its lookahead', () => {
    const { container } = render(
      <MediaEntertainmentBillboardHero titles={createMediaRailItems(5)} />,
    )

    // All five slides sit inside the viewport, where `loading="lazy"` defers
    // nothing, so mounting them all would race five backdrops against the LCP.
    expect(container.querySelectorAll('img')).toHaveLength(2)
  })

  it('keeps earlier backdrops mounted once a later slide is shown', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MediaEntertainmentBillboardHero titles={createMediaRailItems(5)} />,
    )

    await user.click(screen.getByRole('button', { name: 'Show Title 4' }))

    // Slides 0 and 1 from the initial mount, plus 3 and 4 for the jump: an
    // unmount here would re-trigger Next's loader mid-crossfade.
    await waitFor(() =>
      expect(container.querySelectorAll('img')).toHaveLength(4),
    )
  })

  it.each(['Play', 'More info'])(
    'opens the detail sheet from %s',
    async (label) => {
      const user = userEvent.setup()
      const store = createTestStore()

      render(<MediaEntertainmentBillboardHero titles={[createMediaRailItem()]} />, {
        wrapper: buildJotaiWrapper(store),
      })

      await user.click(screen.getByRole('button', { name: label }))

      expect(store.get(selectedMediaTitleAtom)?.objectID).toBe('movie_1')
    },
  )

  it('adds the active title to My List, then offers to remove it', async () => {
    const user = userEvent.setup()

    render(<MediaEntertainmentBillboardHero titles={[createMediaRailItem()]} />, {
      wrapper: buildJotaiWrapper(createTestStore()),
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Add Blade Runner 2049 to My List',
      }),
    )

    expect(
      screen.getByRole('button', {
        name: 'Remove Blade Runner 2049 from My List',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('puts the title into Continue Watching when Play is pressed', async () => {
    const user = userEvent.setup()
    const store = createTestStore()

    render(<MediaEntertainmentBillboardHero titles={[createMediaRailItem()]} />, {
      wrapper: buildJotaiWrapper(store),
    })

    await user.click(screen.getByRole('button', { name: 'Play' }))

    expect(
      store.get(getMediaWatchStateAtom(SLUG)).anonymous?.continueWatching,
    ).toEqual([
      { objectID: 'movie_1', addedAt: expect.any(Number), progress: 0.06 },
    ])
  })

  // Rotation on, unlike the rest of the file: pausing is only observable as a
  // tick that does or does not land. Asserts on the indicators, which track the
  // index without waiting on the heading's crossfade.
  describe('focus pausing', () => {
    beforeEach(() => {
      installMatchMedia(false)
      vi.useFakeTimers()
    })

    afterEach(() => vi.useRealTimers())

    const renderHero = () => {
      render(
        <>
          <MediaEntertainmentBillboardHero titles={createMediaRailItems(3)} />
          <button type="button">Outside the hero</button>
        </>,
      )

      return {
        play: screen.getByRole('button', { name: 'Play' }),
        outside: screen.getByRole('button', { name: 'Outside the hero' }),
        indicators: () => screen.getAllByRole('button', { name: /^Show / }),
      }
    }

    const advancePastOneInterval = () =>
      act(() => vi.advanceTimersByTime(DEFAULT_ROTATION_INTERVAL_MS + 1))

    it('stays paused while focus moves between controls inside the hero', () => {
      const { play, indicators } = renderHero()

      act(() => play.focus())
      act(() => screen.getByRole('button', { name: 'More info' }).focus())

      advancePastOneInterval()

      expect(indicators()[0]).toHaveAttribute('aria-current', 'true')
    })

    it('resumes once focus leaves the hero entirely', () => {
      const { play, outside, indicators } = renderHero()

      act(() => play.focus())
      act(() => outside.focus())

      advancePastOneInterval()

      expect(indicators()[1]).toHaveAttribute('aria-current', 'true')
    })
  })
})
