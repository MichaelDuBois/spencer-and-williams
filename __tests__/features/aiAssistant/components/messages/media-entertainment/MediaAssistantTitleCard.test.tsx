import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaAssistantTitleCard } from '@/features/aiAssistant/components/messages/media-entertainment/MediaAssistantTitleCard'
import { getMediaTitleQueryKey } from '@/features/aiAssistant/hooks/search/useMediaEntertainmentSearch'
import { track } from '@/lib/analytics/track'
import { selectedMediaTitleAtom } from '@/stores/mediaEntertainment'

import { createMediaRailItem } from '@/../__tests__/app/media-entertainment/_helpers/railFixtures'
import { createTestQueryClient, render } from '@tests/helpers/test-utils'

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

const renderCard = () => {
  const queryClient = createTestQueryClient()
  const title = createMediaRailItem()
  queryClient.setQueryData(getMediaTitleQueryKey(title.objectID), title)

  return render(
    <MediaAssistantTitleCard item={{ objectID: title.objectID, why: '' }} />,
    { queryClient },
  )
}

const resultClickCalls = () =>
  vi
    .mocked(track)
    .mock.calls.filter(
      ([eventName]) => eventName === 'assistant_result_clicked',
    )

describe('MediaAssistantTitleCard', () => {
  beforeEach(() => {
    vi.mocked(track).mockClear()
    // The watch-state atom is sessionStorage-backed, so a toggle would leak.
    sessionStorage.clear()
  })

  it('tracks the title as an assistant result when it opens', async () => {
    const user = userEvent.setup()
    const { store } = renderCard()

    await user.click(screen.getByRole('link', { name: /Blade Runner 2049/ }))

    expect(resultClickCalls()).toEqual([
      [
        'assistant_result_clicked',
        { surface: 'ai_assistant', objectID: 'movie_1' },
      ],
    ])
    expect(store.get(selectedMediaTitleAtom)?.objectID).toBe('movie_1')
  })

  it('tracks nothing for a cmd-click, which the card leaves to the browser', () => {
    renderCard()

    const link = screen.getByRole('link', { name: /Blade Runner 2049/ })
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link, { metaKey: true })

    expect(resultClickCalls()).toEqual([])
  })

  it('tracks nothing when the My List toggle is used', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(
      screen.getByRole('button', { name: 'Add Blade Runner 2049 to My List' }),
    )

    expect(resultClickCalls()).toEqual([])
  })
})
