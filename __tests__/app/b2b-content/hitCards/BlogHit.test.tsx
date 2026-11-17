import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BlogHit } from '@/app/b2b-content/_components/hitCards/BlogHit'
import { b2bContentConfig } from '@/app/b2b-content/config'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

const { trackMock } = vi.hoisted(() => {
  return { trackMock: vi.fn() }
})

vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
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

const hit = {
  objectID: 'B1',
  title: 'Search relevance 101',
  __queryID: 'q1',
  __position: 1,
} as AlgoliaHit<BaseHit>

// jsdom does not implement navigation, so keep the click from following the link.
const clickLink = () => {
  const link = screen.getByRole('link')
  link.addEventListener('click', (event) => event.preventDefault())
  fireEvent.click(link)
}

describe('BlogHit', () => {
  it('tracks a click as a blog from the blogs index', () => {
    render(<BlogHit hit={hit} />)

    clickLink()

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('content_clicked', {
      objectID: 'B1',
      contentType: 'blog',
      index: b2bContentConfig.algolia.indices.blogs.name,
      position: 1,
      queryID: 'q1',
    })
  })
})
