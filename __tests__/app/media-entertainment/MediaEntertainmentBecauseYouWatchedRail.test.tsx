import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentBecauseYouWatchedRail } from '@/app/media-entertainment/_components/MediaEntertainmentBecauseYouWatchedRail'
import type { UseBecauseYouWatchedResult } from '@/app/media-entertainment/_hooks/useMediaBecauseYouWatched'

import {
  createMediaRail,
  createMediaRailItems,
} from '@tests/app/media-entertainment/_helpers/railFixtures'
import { buildJotaiWrapper, createTestStore } from '@tests/helpers/jotai-wrapper'

const hookResult: UseBecauseYouWatchedResult = {
  rail: null,
  isPending: false,
}

vi.mock('@/app/media-entertainment/_hooks/useMediaBecauseYouWatched', () => {
  return {
    useMediaBecauseYouWatched: () => hookResult,
  }
})

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendConversionEvent: vi.fn(), sendProductClickEvent: vi.fn() }
    },
  }
})

const RAIL_TITLE = 'Because you watched Iron Man'

const renderRail = () =>
  render(<MediaEntertainmentBecauseYouWatchedRail />, {
    wrapper: buildJotaiWrapper(createTestStore()),
  })

const heading = () => screen.queryByRole('heading', { name: RAIL_TITLE })

describe('MediaEntertainmentBecauseYouWatchedRail', () => {
  beforeEach(() => {
    hookResult.rail = null
    hookResult.isPending = false
  })

  it('renders nothing when there is no seed to name the row after', () => {
    renderRail()

    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('renders the row once the model returns titles', () => {
    hookResult.rail = createMediaRail({
      id: 'because-you-watched',
      title: RAIL_TITLE,
      items: createMediaRailItems(3),
    })
    renderRail()

    expect(heading()).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('hides the row rather than rendering it empty when the model returns nothing', () => {
    hookResult.rail = createMediaRail({
      id: 'because-you-watched',
      title: RAIL_TITLE,
      items: [],
    })
    renderRail()

    expect(heading()).toBeNull()
  })

  it('shows a skeleton under the real heading while the model resolves', () => {
    hookResult.rail = createMediaRail({
      id: 'because-you-watched',
      title: RAIL_TITLE,
      items: [],
    })
    hookResult.isPending = true
    renderRail()

    expect(heading()).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
