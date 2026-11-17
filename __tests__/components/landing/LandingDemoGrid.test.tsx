import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LANDING_CARD_ATTRIBUTES } from '@/components/landing/landing-card-attributes'
import { LandingDemoGrid } from '@/components/landing/LandingDemoGrid'

afterEach(() => vi.restoreAllMocks())

describe('LandingDemoGrid', () => {
  it('matches each row to its natural collapsed height without including expanded content', () => {
    let onResize: ResizeObserverCallback | undefined
    const observer: ResizeObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
    vi.spyOn(globalThis, 'ResizeObserver').mockImplementation(
      function (callback) {
        onResize = callback
        return observer
      },
    )
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function (this: HTMLElement) {
        return Number(this.dataset.height ?? 0)
      },
    )
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(
      function (this: HTMLElement) {
        return Number(this.dataset.left ?? 0)
      },
    )

    const { container, unmount } = render(
      <LandingDemoGrid>
        <article
          {...{ [LANDING_CARD_ATTRIBUTES.card]: true }}
          data-height="340"
          data-left="0"
          data-testid="expanded">
          <div {...{ [LANDING_CARD_ATTRIBUTES.body]: true }} />
          <div
            {...{ [LANDING_CARD_ATTRIBUTES.content]: true }}
            data-height="120"
          />
        </article>
        <article
          {...{ [LANDING_CARD_ATTRIBUTES.card]: true }}
          data-height="260"
          data-left="300"
          data-testid="neighbour">
          <div {...{ [LANDING_CARD_ATTRIBUTES.body]: true }} />
        </article>
        <article
          {...{ [LANDING_CARD_ATTRIBUTES.card]: true }}
          data-height="240"
          data-left="0"
          data-testid="next-row">
          <div {...{ [LANDING_CARD_ATTRIBUTES.body]: true }} />
        </article>
      </LandingDemoGrid>,
    )

    expect(screen.getByTestId('expanded')).toHaveStyle({ minHeight: '260px' })
    expect(screen.getByTestId('neighbour')).toHaveStyle({ minHeight: '260px' })
    expect(screen.getByTestId('next-row')).toHaveStyle({ minHeight: '240px' })

    const grid = container.firstElementChild
    if (!grid) throw new Error('Missing grid')
    const entry: ResizeObserverEntry = {
      target: grid,
      contentRect: new DOMRect(0, 0, 200, 400),
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    }

    // A partial open/close animation contributes no height to the collapsed row.
    const animatedCard = screen.getByTestId('expanded')
    const animatedPanel = animatedCard.querySelector<HTMLElement>(
      `[${LANDING_CARD_ATTRIBUTES.content}]`,
    )
    const animatedBody = animatedCard.firstElementChild
    if (!animatedPanel || !animatedBody)
      throw new Error('Missing animated card content')
    animatedCard.dataset.height = '280'
    animatedPanel.dataset.height = '60'
    onResize?.([{ ...entry, target: animatedBody }], observer)
    expect(animatedCard).toHaveStyle({ minHeight: '260px' })
    expect(screen.getByTestId('neighbour')).toHaveStyle({ minHeight: '260px' })

    // At a one-column breakpoint each card returns to its own collapsed height.
    screen.getByTestId('neighbour').dataset.left = '0'
    onResize?.([entry], observer)
    expect(screen.getByTestId('expanded')).toHaveStyle({ minHeight: '220px' })
    expect(screen.getByTestId('neighbour')).toHaveStyle({ minHeight: '260px' })
    // Expanding the grid alone must not trigger another alignment pass.
    screen.getByTestId('neighbour').dataset.height = '500'
    onResize?.(
      [{ ...entry, contentRect: new DOMRect(0, 0, 200, 700) }],
      observer,
    )
    expect(screen.getByTestId('neighbour')).toHaveStyle({ minHeight: '260px' })

    // Intrinsic body changes still trigger a recalculation, e.g. after fonts load.
    const body = screen.getByTestId('neighbour').firstElementChild
    if (!body) throw new Error('Missing card body')
    onResize?.([{ ...entry, target: body }], observer)
    expect(screen.getByTestId('neighbour')).toHaveStyle({ minHeight: '500px' })
    unmount()
    expect(observer.disconnect).toHaveBeenCalledOnce()
  })
})
