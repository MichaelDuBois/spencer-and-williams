import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DeliveryTracker } from '@/components/order/DeliveryTracker'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { DAY_MS, DELIVERY_TIMELINE_DAYS } from '@/utilities/orderStatus'

const CREATED_AT = Date.UTC(2026, 0, 10, 12)

const STEP_LABELS = ['Confirmed', 'In Transit', 'Delivered']

/**
 * How many steps render as reached — the labels use `labelCompleted` rather than
 * `labelIncomplete`. Equals the active step, since every step up to the current
 * one counts as completed.
 */
const completedStepCount = (scope?: HTMLElement): number => {
  const query = scope ? within(scope) : screen
  return STEP_LABELS.filter(
    (label) =>
      !query.getByText(label).classList.contains('text-muted-foreground'),
  ).length
}

describe('DeliveryTracker', () => {
  it('anchors the Confirmed date to the order date, not today', () => {
    render(<DeliveryTracker variant="standard" createdAt={CREATED_AT} />)

    expect(screen.getByText('Jan 10')).toBeInTheDocument()
  })

  it('derives the later step dates from the order date', () => {
    render(<DeliveryTracker variant="standard" createdAt={CREATED_AT} />)

    // +2 and +5 days from Jan 10.
    expect(screen.getByText('Jan 12')).toBeInTheDocument()
    expect(screen.getByText('Jan 15')).toBeInTheDocument()
  })

  it('uppercases the dates in the editorial variant', () => {
    render(<DeliveryTracker variant="editorial" createdAt={CREATED_AT} />)

    expect(screen.getByText('JAN 10')).toBeInTheDocument()
  })

  it('reaches only Confirmed for a fresh order', () => {
    render(<DeliveryTracker variant="standard" createdAt={Date.now()} />)

    expect(completedStepCount()).toBe(1)
  })

  it('reaches In Transit once the order ships', () => {
    const createdAt = Date.now() - DELIVERY_TIMELINE_DAYS.inTransit * DAY_MS
    render(<DeliveryTracker variant="standard" createdAt={createdAt} />)

    expect(completedStepCount()).toBe(2)
  })

  it('reaches Delivered once the order lands', () => {
    const createdAt = Date.now() - DELIVERY_TIMELINE_DAYS.delivered * DAY_MS
    render(<DeliveryTracker variant="standard" createdAt={createdAt} />)

    expect(completedStepCount()).toBe(3)
  })

  // The drift DELIVERY_TIMELINE_DAYS exists to prevent: revisiting an older
  // order showed "Confirmed today / step 1" while the badge said Delivered.
  it('agrees with OrderStatusBadge for an older order', () => {
    const createdAt = Date.now() - 7 * DAY_MS

    const { container: tracker } = render(
      <DeliveryTracker variant="standard" createdAt={createdAt} />,
    )
    const { container: badge } = render(
      <OrderStatusBadge createdAt={createdAt} />,
    )

    expect(within(badge).getByText('Delivered')).toBeInTheDocument()
    expect(completedStepCount(tracker)).toBe(3)
  })
})
