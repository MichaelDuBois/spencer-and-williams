import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { MAX_VISIBLE_TITLES } from '@/features/aiAssistant/components/messages/media-entertainment/constants'
import { MediaTitleResultGroup } from '@/features/aiAssistant/components/messages/media-entertainment/MediaTitleResultGroup'
import { getMediaTitleQueryKey } from '@/features/aiAssistant/hooks/search/useMediaEntertainmentSearch'
import type { MediaDisplayGroup } from '@/features/aiAssistant/types'

import { createMediaRailItem } from '@/../__tests__/app/media-entertainment/_helpers/railFixtures'
import { createTestQueryClient, render } from '@tests/helpers/test-utils'

const buildGroup = (
  overrides: Partial<MediaDisplayGroup> = {},
): MediaDisplayGroup => ({
    type: 'movie',
    title: 'Smart comedies',
    why: 'Funny without being dumb',
    items: [{ objectID: 'movie_1', why: 'Deadpan and clever' }],
    ...overrides,
  } as MediaDisplayGroup)

/** Seeds the cache the cards read from, the way a completed search would. */
const renderGroup = (
  group: MediaDisplayGroup,
  titles: MediaTitleHit[] = [createMediaRailItem()],
) => {
  const queryClient = createTestQueryClient()

  for (const title of titles) {
    queryClient.setQueryData(getMediaTitleQueryKey(title.objectID), title)
  }

  return render(<MediaTitleResultGroup group={group} />, { queryClient })
}

describe('MediaTitleResultGroup', () => {
  it('renders the group heading and reason', () => {
    renderGroup(buildGroup())

    expect(screen.getByText('Smart comedies')).toBeInTheDocument()
    expect(screen.getByText('Funny without being dumb')).toBeInTheDocument()
  })

  it('renders the resolved title as a poster card with the agent reason', () => {
    renderGroup(buildGroup())

    expect(screen.getByText('Blade Runner 2049')).toBeInTheDocument()
    expect(screen.getByText('Deadpan and clever')).toBeInTheDocument()
  })

  it('shows a skeleton for an objectID no search has resolved', () => {
    const { container } = renderGroup(
      buildGroup({ items: [{ objectID: 'unresolved', why: 'Worth a look' }] }),
      [],
    )

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Blade Runner 2049')).not.toBeInTheDocument()
  })

  // A shelf at every width — never a grid, which would read as a result page.
  it('lays the posters out as a horizontal track', () => {
    const { container } = renderGroup(buildGroup())

    expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument()
    expect(container.querySelector('.grid')).not.toBeInTheDocument()
  })

  it('caps the number of posters shown', () => {
    const overflow = MAX_VISIBLE_TITLES + 3
    const titles = Array.from({ length: overflow }, (_, index) =>
      createMediaRailItem({
        objectID: `movie_${index + 1}`,
        title: `Title ${index + 1}`,
      }),
    )

    renderGroup(
      buildGroup({
        items: titles.map((title) => {return {
          objectID: title.objectID,
          why: 'A pick',
        }}),
      }),
      titles,
    )

    expect(screen.getByText(`Title ${MAX_VISIBLE_TITLES}`)).toBeInTheDocument()
    expect(
      screen.queryByText(`Title ${MAX_VISIBLE_TITLES + 1}`),
    ).not.toBeInTheDocument()
  })
})
