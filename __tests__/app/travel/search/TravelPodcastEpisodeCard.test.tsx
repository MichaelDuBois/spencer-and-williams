import { fireEvent, render, screen } from '@testing-library/react'
import { getDefaultStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { travelConfig } from '@/app/travel/config'
import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { TravelPodcastEpisodeCard } from '@/app/travel/search/_components/TravelPodcastEpisodeCard'
import { isFromHomePageAtom } from '@/stores/travel'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

const { trackMock, usePathnameMock } = vi.hoisted(() => {
  return {
    trackMock: vi.fn(),
    usePathnameMock: vi.fn(() => '/travel/search'),
  }
})

vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

vi.mock('next/navigation', () => {
  return { usePathname: usePathnameMock }
})

vi.mock('react-instantsearch', () => {
  return {
    Highlight: ({ attribute }: { attribute: string }) => (
      <span data-testid="highlight" data-attribute={attribute} />
    ),
  }
})

vi.mock('next/link', () => {
  return {
    default: ({
      children,
      href,
      onClick,
    }: {
      children: React.ReactNode
      href: string
      onClick?: () => void
    }) => (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    ),
  }
})

const episode: PodcastHitValues = {
  objectID: 'p1',
  productUrl: '/travel/podcast/p1',
  title: 'Slow travel in Japan',
}

const hit = {
  objectID: 'p1',
  __queryID: 'q1',
  __position: 2,
} as AlgoliaHit<BaseHit>

const template = travelConfig.algolia.indices.podcasts.template!

// jsdom does not implement navigation, so keep the click from following the link.
const clickLink = () => {
  const link = screen.getByRole('link')
  link.addEventListener('click', (event) => event.preventDefault())
  fireEvent.click(link)
}

describe('TravelPodcastEpisodeCard', () => {
  beforeEach(() => {
    trackMock.mockClear()
    usePathnameMock.mockReturnValue('/travel/search')
    getDefaultStore().set(isFromHomePageAtom, false)
  })

  it('tracks a click as a podcast from the podcasts index', () => {
    render(
      <TravelPodcastEpisodeCard
        episode={episode}
        hit={hit}
        template={template}
      />,
    )

    clickLink()

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('content_clicked', {
      objectID: 'p1',
      contentType: 'podcast',
      index: travelConfig.algolia.indices.podcasts.name,
      position: 2,
      queryID: 'q1',
    })
  })

  it('still flags a click from the homepage', () => {
    usePathnameMock.mockReturnValue('/travel')
    render(
      <TravelPodcastEpisodeCard
        episode={episode}
        hit={hit}
        template={template}
      />,
    )

    clickLink()

    expect(getDefaultStore().get(isFromHomePageAtom)).toBe(true)
    expect(trackMock).toHaveBeenCalledTimes(1)
  })

  it('tracks nothing when rendered without a hit', () => {
    render(<TravelPodcastEpisodeCard episode={episode} />)

    clickLink()

    expect(trackMock).not.toHaveBeenCalled()
  })
})
