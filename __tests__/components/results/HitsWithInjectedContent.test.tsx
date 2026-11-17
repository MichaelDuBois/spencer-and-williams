import { cleanup, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { HitsWithInjectedContent } from '@/components/results/HitsWithInjectedContent'

import type { ComponentProps } from 'react'

const useHits = vi.hoisted(() => vi.fn())
const Hits = vi.hoisted(() =>
  vi.fn(() => <div data-testid="plain-hits">plain hits</div>),
)

vi.mock('react-instantsearch', () => {
  return { useHits, Hits, ResultCard: () => <div>AI Overview</div> }
})

vi.mock('@/components/results/NoResultsRecovery', () => {
  return {
    NoResultsRecovery: () => <div data-testid="no-results-recovery" />,
  }
})

vi.mock('@/features/chatWidget/hooks/useIsChatWidgetActive', () => {
  return {
    useIsChatWidgetActive: () => true,
  }
})
vi.mock('@/hooks/useActiveConfig', () => {
  return {
    useActiveConfig: () => {
      return {
        slug: 'ecommerce',
        features: { agentStudio: { chatWidgetAgentID: 'agent' } },
      }
    },
  }
})

vi.mock('@/features/chatWidget/components/ComparableSearchHit', () => {return {
  ComparableSearchHit: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="comparison-wrapper">{children}</div>
  ),
}})

const buildItems = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    return {
      objectID: `p${index + 1}`,
      __position: index + 1,
    }
  })

const renderGrid = ({
  itemCount,
  afterIndex,
  span = 'cell',
  replacesHit = false,
  transformItems,
}: {
  itemCount: number
  afterIndex: number
  span?: 'row' | 'cell'
  replacesHit?: boolean
  transformItems?: ComponentProps<
    typeof HitsWithInjectedContent
  >['transformItems']
}) => {
  // Mirror the connector: `transformItems` is applied to the raw hits, and the
  // component sees only what it returns.
  useHits.mockImplementation(({ transformItems } = {}) => {
    return {
      items: transformItems
        ? transformItems(buildItems(itemCount))
        : buildItems(itemCount),
    }
  })

  return render(
    <HitsWithInjectedContent
      hitComponent={({ hit }) => <span>{hit.objectID as string}</span>}
      classNames={{ list: 'grid', item: 'cell' }}
      transformItems={transformItems}
      injection={{
        content: <span data-testid="injected">injected content</span>,
        afterIndex,
        span,
        replacesHit,
      }}
    />,
  )
}

const renderedOrder = () =>
  [...document.querySelectorAll('li')].map((li) =>
    li.querySelector('[data-testid="injected"]') ? 'content' : li.textContent,
  )

describe('HitsWithInjectedContent', () => {
  it('leaves chat features to the caller with and without injected content', () => {
    const { unmount } = renderGrid({ itemCount: 1, afterIndex: 2 })
    expect(screen.queryByText('AI Overview')).not.toBeInTheDocument()
    expect(screen.queryByTestId('comparison-wrapper')).not.toBeInTheDocument()
    unmount()
    render(
      <HitsWithInjectedContent
        hitComponent={() => null}
        classNames={{ list: 'grid', item: 'cell' }}
      />,
    )
    expect(screen.queryByText('AI Overview')).not.toBeInTheDocument()
    expect(screen.queryByTestId('comparison-wrapper')).not.toBeInTheDocument()
  })

  it('preserves hit components when the parent supplies a new render callback', () => {
    const onMount = vi.fn()
    const onUnmount = vi.fn()
    const Probe = () => {
      useEffect(() => {
        onMount()
        return onUnmount
      }, [])
      return <span>Product</span>
    }
    useHits.mockReturnValue({ items: buildItems(1) })
    const renderListing = () => (
      <HitsWithInjectedContent
        hitComponent={() => <Probe />}
        classNames={{ list: 'grid', item: 'cell' }}
        injection={{ content: null, afterIndex: 2 }}
      />
    )
    const { rerender } = render(renderListing())
    rerender(renderListing())
    expect(onMount).toHaveBeenCalledTimes(1)
    expect(onUnmount).not.toHaveBeenCalled()
  })
  it('filters products before deciding where to place injected content', () => {
    renderGrid({
      itemCount: 8,
      afterIndex: 5,
      replacesHit: true,
      transformItems: (hits) =>
        hits.filter((hit) => hit.objectID === 'p2' || hit.objectID === 'p8'),
    })
    expect(renderedOrder()).toEqual(['p2', 'p8'])
    expect(screen.queryByTestId('injected')).not.toBeInTheDocument()
  })

  it('places the content after the requested number of hits', () => {
    renderGrid({ itemCount: 10, afterIndex: 5 })

    expect(renderedOrder()).toEqual([
      'p1',
      'p2',
      'p3',
      'p4',
      'p5',
      'content',
      'p6',
      'p7',
      'p8',
      'p9',
      'p10',
    ])
  })

  it('renders every hit exactly once alongside the content', () => {
    renderGrid({ itemCount: 10, afterIndex: 5 })

    expect(document.querySelectorAll('li')).toHaveLength(11)
    expect(screen.getAllByTestId('injected')).toHaveLength(1)
  })

  // Past the end the slot would trail the grid as an orphan cell.
  it('omits the content when the slot falls beyond the last hit', () => {
    renderGrid({ itemCount: 4, afterIndex: 5 })

    expect(screen.queryByTestId('injected')).not.toBeInTheDocument()
    expect(document.querySelectorAll('li')).toHaveLength(4)
  })

  it('renders nothing when there are no hits', () => {
    renderGrid({ itemCount: 0, afterIndex: 5 })

    expect(document.querySelectorAll('li')).toHaveLength(0)
    expect(screen.queryByTestId('injected')).not.toBeInTheDocument()
  })

  describe('replacesHit', () => {
    // Without this the grid gains a cell on pages carrying the content, and its
    // row rhythm shifts as the user pages.
    it('keeps the cell count equal to a page with no injected content', () => {
      renderGrid({ itemCount: 20, afterIndex: 5, replacesHit: true })

      expect(document.querySelectorAll('li')).toHaveLength(20)
      expect(screen.getAllByTestId('injected')).toHaveLength(1)
    })

    it('gives up the last hit rather than one around the slot', () => {
      renderGrid({ itemCount: 8, afterIndex: 5, replacesHit: true })

      expect(renderedOrder()).toEqual([
        'p1',
        'p2',
        'p3',
        'p4',
        'p5',
        'content',
        'p6',
        'p7',
      ])
    })

    it('keeps every hit when the slot falls beyond the last one', () => {
      renderGrid({ itemCount: 4, afterIndex: 5, replacesHit: true })

      expect(screen.queryByTestId('injected')).not.toBeInTheDocument()
      expect(renderedOrder()).toEqual(['p1', 'p2', 'p3', 'p4'])
    })

    // Boundary: with exactly afterIndex + 1 hits, giving one up would push the
    // slot past the end, so the hit would be lost and no content shown.
    it('keeps every hit rather than trade one for a slot it cannot place', () => {
      renderGrid({ itemCount: 6, afterIndex: 5, replacesHit: true })

      expect(renderedOrder()).toEqual([
        'p1',
        'p2',
        'p3',
        'p4',
        'p5',
        'content',
        'p6',
      ])
    })

    it('never drops a hit without showing the content', () => {
      for (const itemCount of [1, 2, 3, 4, 5, 6, 7, 8, 20]) {
        renderGrid({ itemCount, afterIndex: 5, replacesHit: true })
        const order = renderedOrder()
        const products = order.filter((entry) => entry !== 'content').length
        const hasContent = order.includes('content')
        const given = itemCount - products

        // At most one hit is ever given up, and only in exchange for the
        // content appearing — never for nothing.
        expect(given).toBeLessThanOrEqual(1)
        if (given === 1) expect(hasContent).toBe(true)
        cleanup()
      }
    })
  })

  // The five commerce verticals inject a full-width filter-suggestions banner
  // and rely on it showing even when the result set is smaller than afterIndex.
  describe("span 'row'", () => {
    it('spans the full grid width instead of taking a cell', () => {
      renderGrid({ itemCount: 10, afterIndex: 6, span: 'row' })

      const slot = screen.getByTestId('injected').closest('li')
      expect(slot).toHaveClass('col-span-full')
      expect(slot).not.toHaveClass('cell')
    })

    it('places the row after the requested number of hits', () => {
      renderGrid({ itemCount: 10, afterIndex: 6, span: 'row' })

      expect(renderedOrder().indexOf('content')).toBe(6)
      expect(document.querySelectorAll('li')).toHaveLength(11)
    })

    // A row settles at the end rather than disappearing, so small result sets
    // still get their banner.
    it('settles at the end when there are fewer hits than the slot index', () => {
      renderGrid({ itemCount: 3, afterIndex: 6, span: 'row' })

      expect(renderedOrder()).toEqual(['p1', 'p2', 'p3', 'content'])
    })

    it('never gives up a hit, even when asked to replace one', () => {
      renderGrid({
        itemCount: 20,
        afterIndex: 6,
        span: 'row',
        replacesHit: true,
      })

      const products = renderedOrder().filter((entry) => entry !== 'content')
      expect(products).toHaveLength(20)
    })

    it('renders nothing when there are no hits', () => {
      renderGrid({ itemCount: 0, afterIndex: 6, span: 'row' })

      expect(document.querySelectorAll('li')).toHaveLength(0)
      expect(screen.queryByTestId('injected')).not.toBeInTheDocument()
    })
  })

  it('falls back to the standard Hits widget when there is no injection', () => {
    render(
      <HitsWithInjectedContent
        hitComponent={({ hit }) => <span>{hit.objectID as string}</span>}
        classNames={{ list: 'grid', item: 'cell' }}
      />,
    )

    expect(screen.getByTestId('plain-hits')).toBeInTheDocument()
    expect(screen.getByTestId('no-results-recovery')).toBeInTheDocument()
  })
})
