import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { B2BContentCard } from '@/app/b2b-content/_components/hitCards/B2BContentCard'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

const { trackMock } = vi.hoisted(() => {
  return { trackMock: vi.fn() }
})

vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

vi.mock('react-instantsearch', () => {return {
  Highlight: ({ attribute }: { attribute: string }) => (
    <span data-testid="highlight" data-attribute={attribute} />
  ),
}})

vi.mock('next/link', () => {return {
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
}})

const hit = { objectID: 'C1' } as AlgoliaHit<BaseHit>

const contentProps = {
  contentType: 'blog',
  indexName: 'blogs_index',
} as const

// jsdom does not implement navigation, so keep the click from following the link.
const clickLink = () => {
  const link = screen.getByRole('link')
  link.addEventListener('click', (event) => event.preventDefault())
  fireEvent.click(link)
}

describe('B2BContentCard', () => {
  beforeEach(() => {
    trackMock.mockClear()
  })

  it('highlights the title via the configured attribute', () => {
    render(
      <B2BContentCard
        hit={hit}
        title="A Title"
        titleAttribute="title"
        {...contentProps}
      />,
    )
    expect(screen.getByTestId('highlight')).toHaveAttribute(
      'data-attribute',
      'title',
    )
  })

  it('renders the badge when one is provided', () => {
    render(
      <B2BContentCard
        hit={hit}
        title="A Title"
        titleAttribute="title"
        {...contentProps}
        badge="Guide"
      />,
    )
    expect(screen.getByText('Guide')).toBeInTheDocument()
  })

  it('wraps the card in a link when href is provided', () => {
    render(
      <B2BContentCard
        hit={hit}
        title="A Title"
        titleAttribute="title"
        {...contentProps}
        href="/b2b-content/blogs/C1"
      />,
    )
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/b2b-content/blogs/C1',
    )
  })

  it('renders without a link when href is omitted', () => {
    render(
      <B2BContentCard
        hit={hit}
        title="A Title"
        titleAttribute="title"
        {...contentProps}
      />,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('tracks a link click with its content type and index', () => {
    render(
      <B2BContentCard
        hit={{ ...hit, __queryID: 'q1', __position: 5 }}
        title="A Title"
        titleAttribute="title"
        {...contentProps}
        href="/b2b-content/blogs/C1"
      />,
    )

    clickLink()

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('content_clicked', {
      objectID: 'C1',
      contentType: 'blog',
      index: 'blogs_index',
      position: 5,
      queryID: 'q1',
    })
  })
})
