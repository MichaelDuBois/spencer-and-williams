import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MediaProgressTitle } from '@/app/media-entertainment/_hooks/useMediaWatchRails'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { MediaEntertainmentMyListPage } from '@/app/media-entertainment/my-list/_components/MediaEntertainmentMyListPage'
import type { MediaRail } from '@/app/media-entertainment/types'

import {
  createMediaRail,
  createMediaRailItem,
} from '@tests/app/media-entertainment/_helpers/railFixtures'
import { buildJotaiWrapper, createTestStore } from '@tests/helpers/jotai-wrapper'

const watchRailsResult = {
  myListTitles: [] as MediaTitleHit[],
  continueWatchingTitles: [] as MediaProgressTitle[],
  isPending: false,
}

const suggestionsResult = {
  rails: [] as MediaRail[],
  billboardTitles: [],
  isPending: false,
  isError: false,
  refetch: vi.fn(),
}

vi.mock('@/app/media-entertainment/_hooks/useMediaWatchRails', () => {
  return {
    useMediaWatchRails: () => watchRailsResult,
  }
})

vi.mock('@/app/media-entertainment/_hooks/useMediaEntertainmentRails', () => {
  return {
    useMediaEntertainmentRails: () => suggestionsResult,
  }
})

const SUGGESTIONS_TITLE = mediaEntertainmentConfig.myListSuggestionsRail!.title

const renderPage = () =>
  render(<MediaEntertainmentMyListPage />, {
    wrapper: buildJotaiWrapper(createTestStore()),
  })

describe('MediaEntertainmentMyListPage', () => {
  beforeEach(() => {
    watchRailsResult.myListTitles = []
    watchRailsResult.isPending = false
    suggestionsResult.rails = []
    suggestionsResult.isPending = false
    suggestionsResult.isError = false
  })

  it('renders the saved titles as a grid', () => {
    watchRailsResult.myListTitles = [createMediaRailItem()]
    renderPage()

    expect(
      screen.getByRole('link', { name: /Blade Runner 2049/ }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Nothing saved yet.')).toBeNull()
  })

  it('suggests titles while the list is empty', () => {
    suggestionsResult.rails = [
      createMediaRail({ id: 'my-list-suggestions', title: SUGGESTIONS_TITLE }),
    ]
    renderPage()

    expect(screen.getByText('Nothing saved yet.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Browse titles' }),
    ).toHaveAttribute('href', `/${mediaEntertainmentConfig.slug}`)
    expect(
      screen.getByRole('heading', { name: SUGGESTIONS_TITLE }),
    ).toBeInTheDocument()
  })

  it('drops the suggestions row once something is saved', () => {
    watchRailsResult.myListTitles = [createMediaRailItem()]
    suggestionsResult.rails = [
      createMediaRail({ id: 'my-list-suggestions', title: SUGGESTIONS_TITLE }),
    ]
    renderPage()

    expect(screen.queryByRole('heading', { name: SUGGESTIONS_TITLE })).toBeNull()
  })

  it('suggests nothing while the saved titles are still resolving', () => {
    watchRailsResult.isPending = true
    suggestionsResult.rails = [
      createMediaRail({ id: 'my-list-suggestions', title: SUGGESTIONS_TITLE }),
    ]
    renderPage()

    expect(screen.queryByText('Nothing saved yet.')).toBeNull()
    expect(screen.queryByRole('heading', { name: SUGGESTIONS_TITLE })).toBeNull()
  })

  it('shows a suggestions skeleton while the row itself resolves', () => {
    suggestionsResult.isPending = true
    renderPage()

    expect(
      screen.getByRole('heading', { name: SUGGESTIONS_TITLE }),
    ).toBeInTheDocument()
    // The Browse titles CTA is the only link — no suggestion tiles yet.
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
