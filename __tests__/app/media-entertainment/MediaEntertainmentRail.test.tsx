import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentRail } from '@/app/media-entertainment/_components/MediaEntertainmentRail'

import { createMediaRail, createMediaRailItems } from '@/../__tests__/app/media-entertainment/_helpers/railFixtures'

/**
 * jsdom gives every element a zero-sized layout box and implements no scrolling,
 * so a rail always measures as "content fits" and both arrows stay disabled.
 * This fakes just enough layout to make the row scrollable, then nudges the hook
 * into re-measuring via its resize listener.
 */
const makeScrollable = (scrollport: HTMLElement) => {
  const scrollBy = vi.fn()

  Object.defineProperties(scrollport, {
    clientWidth: { value: 800, configurable: true },
    scrollWidth: { value: 2400, configurable: true },
    scrollLeft: { value: 0, writable: true, configurable: true },
    scrollBy: { value: scrollBy, configurable: true },
  })

  act(() => {
    fireEvent(window, new Event('resize'))
  })

  return scrollBy
}

/**
 * Assertions here are on accessible names and counts, never on width classes:
 * the widths live in `RAIL_VARIANTS`, so asserting them would test the config
 * against itself rather than testing this component.
 */
describe('MediaEntertainmentRail', () => {
  it('renders one link per item', () => {
    render(<MediaEntertainmentRail rail={createMediaRail()} />)

    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('renders a link per item for a larger rail', () => {
    render(
      <MediaEntertainmentRail
        rail={createMediaRail({ items: createMediaRailItems(20) })}
      />,
    )

    expect(screen.getAllByRole('link')).toHaveLength(20)
  })

  it('renders nothing at all when the rail has no items', () => {
    const { container } = render(
      <MediaEntertainmentRail rail={createMediaRail({ items: [] })} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders the rail title as a heading', () => {
    render(<MediaEntertainmentRail rail={createMediaRail()} />)

    expect(
      screen.getByRole('heading', { name: 'Blockbuster Movies' }),
    ).toBeInTheDocument()
  })

  it('exposes the scrollport as a named, focusable region', () => {
    render(<MediaEntertainmentRail rail={createMediaRail()} />)

    const scrollport = screen.getByRole('region', {
      name: 'Blockbuster Movies',
    })

    expect(scrollport).toHaveAttribute('tabindex', '0')
  })

  it('gives the two arrows distinct accessible labels', () => {
    render(<MediaEntertainmentRail rail={createMediaRail()} />)

    expect(
      screen.getByRole('button', { name: 'Scroll Blockbuster Movies left' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Scroll Blockbuster Movies right' }),
    ).toBeInTheDocument()
  })

  it('disables both arrows while the content is not scrollable', () => {
    render(<MediaEntertainmentRail rail={createMediaRail()} />)

    // jsdom reports every layout box as 0, so the rail measures as "fits".
    expect(
      screen.getByRole('button', { name: 'Scroll Blockbuster Movies left' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Scroll Blockbuster Movies right' }),
    ).toBeDisabled()
  })

  it('enables the forward arrow once the row overflows and scrolls a page on click', () => {
    render(<MediaEntertainmentRail rail={createMediaRail()} />)

    const scrollBy = makeScrollable(
      screen.getByRole('region', { name: 'Blockbuster Movies' }),
    )
    const forward = screen.getByRole('button', {
      name: 'Scroll Blockbuster Movies right',
    })

    expect(forward).toBeEnabled()
    // Still at the start, so there is nowhere to go backwards.
    expect(
      screen.getByRole('button', { name: 'Scroll Blockbuster Movies left' }),
    ).toBeDisabled()

    fireEvent.click(forward)

    // clientWidth 800 - 2 * 32px gutter.
    expect(scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: 736 }),
    )
  })

  it('scrolls backwards from the far end', () => {
    render(<MediaEntertainmentRail rail={createMediaRail()} />)

    const scrollport = screen.getByRole('region', {
      name: 'Blockbuster Movies',
    })
    const scrollBy = makeScrollable(scrollport)

    scrollport.scrollLeft = 1600
    act(() => {
      fireEvent(window, new Event('resize'))
    })

    const back = screen.getByRole('button', {
      name: 'Scroll Blockbuster Movies left',
    })

    expect(back).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Scroll Blockbuster Movies right' }),
    ).toBeDisabled()

    fireEvent.click(back)

    expect(scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: -736 }),
    )
  })

  it('names each link after its title', () => {
    render(<MediaEntertainmentRail rail={createMediaRail()} />)

    expect(
      screen.getByRole('link', { name: 'Title 1' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Title 3' }),
    ).toBeInTheDocument()
  })

  it('renders the backdrop shape without changing the accessible structure', () => {
    render(
      <MediaEntertainmentRail
        rail={createMediaRail({ shape: 'backdrop', title: 'New Releases' })}
      />,
    )

    expect(
      screen.getByRole('region', { name: 'New Releases' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })
})
