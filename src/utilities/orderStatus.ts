export type OrderStatus =
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type OrderStatusOverride = Extract<OrderStatus, 'cancelled' | 'returned'>

export const DAY_MS = 86400000

// Mirrors the DeliveryTracker steps: Confirmed on the order date, In Transit at
// +2 days, Delivered at +5. DeliveryTracker imports these so the displayed
// estimate and the derived status cannot drift apart.
export const DELIVERY_TIMELINE_DAYS = { inTransit: 2, delivered: 5 } as const

interface OrderStatusInput {
  createdAt: number
  statusOverride?: OrderStatusOverride
}

export const getOrderStatus = (
  { createdAt, statusOverride }: OrderStatusInput,
  now: number = Date.now(),
): OrderStatus => {
  if (statusOverride) return statusOverride

  const ageDays = Math.floor((now - createdAt) / DAY_MS)

  if (ageDays >= DELIVERY_TIMELINE_DAYS.delivered) return 'delivered'
  if (ageDays >= DELIVERY_TIMELINE_DAYS.inTransit) return 'shipped'
  return 'processing'
}
