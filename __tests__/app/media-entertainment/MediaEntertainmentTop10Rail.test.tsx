import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MediaEntertainmentTop10Rail } from '@/app/media-entertainment/_components/MediaEntertainmentTop10Rail'

import { createMediaRail, createMediaRailItems } from '@/../__tests__/app/media-entertainment/_helpers/railFixtures'

const top10Rail = (itemCount: number) =>
  createMediaRail({
    id: 'top-10',
    title: 'Top 10 Today',
    shape: 'top10',
    items: createMediaRailItems(itemCount),
  })

/** The numerals are the only `aria-hidden` spans this component renders. */
const numeralsIn = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('span[aria-hidden="true"]')).map(
    (numeral) => numeral.textContent,
  )

describe('MediaEntertainmentTop10Rail', () => {
  it('caps the row at ten items even when handed twenty', () => {
    render(<MediaEntertainmentTop10Rail rail={top10Rail(20)} />)

    expect(screen.getAllByRole('link')).toHaveLength(10)
  })

  it('renders the numerals 1 through 10', () => {
    const { container } = render(
      <MediaEntertainmentTop10Rail rail={top10Rail(20)} />,
    )

    expect(numeralsIn(container)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ])
  })

  it('hides the numerals from assistive technology so each name is the title alone', () => {
    render(<MediaEntertainmentTop10Rail rail={top10Rail(10)} />)

    // Were the numeral inside the link or exposed, the name would be "1 Title 1".
    expect(screen.getByRole('link', { name: 'Title 1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Title 10' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '1 Title 1' })).toBeNull()
  })

  it('renders fewer numerals when the rail is short', () => {
    const { container } = render(
      <MediaEntertainmentTop10Rail rail={top10Rail(3)} />,
    )

    expect(numeralsIn(container)).toEqual(['1', '2', '3'])
  })

  it('falls back to positional ranks when items carry no rank', () => {
    const items = createMediaRailItems(3).map((item) => {return { ...item, rank: 0 }})
    const { container } = render(
      <MediaEntertainmentTop10Rail
        rail={createMediaRail({ id: 'top-10', title: 'Top 10 Today', items })}
      />,
    )

    expect(numeralsIn(container)).toEqual(['1', '2', '3'])
  })

  it('renders the title as a heading and the scrollport as a named region', () => {
    render(<MediaEntertainmentTop10Rail rail={top10Rail(10)} />)

    expect(
      screen.getByRole('heading', { name: 'Top 10 Today' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Top 10 Today' }),
    ).toBeInTheDocument()
  })

  it('renders nothing when the rail has no items', () => {
    const { container } = render(
      <MediaEntertainmentTop10Rail rail={top10Rail(0)} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
