import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentContinueWatchingRail } from '@/app/media-entertainment/_components/MediaEntertainmentContinueWatchingRail'
import type { MediaProgressTitle } from '@/app/media-entertainment/_hooks/useMediaWatchRails'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { getMediaWatchStateAtom } from '@/stores/mediaWatchState'

import { createMediaRailItem } from '@tests/app/media-entertainment/_helpers/railFixtures'
import { buildJotaiWrapper, createTestStore } from '@tests/helpers/jotai-wrapper'

const railsResult = {
  myListTitles: [] as MediaTitleHit[],
  continueWatchingTitles: [] as MediaProgressTitle[],
  isPending: false,
}

vi.mock('@/app/media-entertainment/_hooks/useMediaWatchRails', () => {
  return {
    useMediaWatchRails: () => railsResult,
  }
})

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendConversionEvent: vi.fn(), sendProductClickEvent: vi.fn() }
    },
  }
})

const watchStateAtom = getMediaWatchStateAtom(mediaEntertainmentConfig.slug)

const renderRail = () =>
  render(<MediaEntertainmentContinueWatchingRail />, {
    wrapper: buildJotaiWrapper(createTestStore()),
  })

describe('MediaEntertainmentContinueWatchingRail', () => {
  beforeEach(() => {
    sessionStorage.clear()
    railsResult.myListTitles = []
    railsResult.continueWatchingTitles = []
    railsResult.isPending = false
  })

  it('renders nothing while nothing is part-watched', () => {
    renderRail()

    expect(
      screen.queryByRole('heading', { name: 'Continue Watching' }),
    ).toBeNull()
  })

  it('renders the row once a title is part-watched', () => {
    railsResult.continueWatchingTitles = [
      { ...createMediaRailItem(), progress: 0.3 },
    ]
    renderRail()

    expect(
      screen.getByRole('heading', { name: 'Continue Watching' }),
    ).toBeInTheDocument()
  })

  it('never renders a My List row — that lives on its own page', () => {
    railsResult.myListTitles = [createMediaRailItem()]
    renderRail()

    expect(screen.queryByRole('heading', { name: 'My List' })).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('draws the progress bar at the stored percentage', () => {
    railsResult.continueWatchingTitles = [
      { ...createMediaRailItem(), progress: 0.42 },
    ]
    renderRail()

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '42',
    )
  })

  it('drops the title from the store when its dismiss control is used', async () => {
    const user = userEvent.setup()
    railsResult.continueWatchingTitles = [
      { ...createMediaRailItem(), progress: 0.3 },
    ]
    // Only the resolved titles are mocked; the watch state itself is the real
    // store, so the click has somewhere to land.
    const store = createTestStore((testStore) =>
      testStore.set(watchStateAtom, {
        anonymous: {
          myList: [],
          continueWatching: [
            { objectID: 'movie_1', addedAt: 1, progress: 0.3 },
          ],
        },
      }),
    )

    render(<MediaEntertainmentContinueWatchingRail />, {
      wrapper: buildJotaiWrapper(store),
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Blade Runner 2049 from Continue Watching',
      }),
    )

    expect(store.get(watchStateAtom).anonymous?.continueWatching).toEqual([])
  })

  it('shows a skeleton while the titles resolve', () => {
    railsResult.isPending = true
    renderRail()

    expect(
      screen.getByRole('heading', { name: 'Continue Watching' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
