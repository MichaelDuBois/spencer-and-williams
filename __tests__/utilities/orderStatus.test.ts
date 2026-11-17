import { describe, expect, it } from 'vitest'

import { DAY_MS, DELIVERY_TIMELINE_DAYS, getOrderStatus } from '@/utilities/orderStatus'

const NOW = new Date('2026-07-30T12:00:00Z').getTime()

const daysAgo = (days: number) => NOW - days * DAY_MS

describe('getOrderStatus', () => {
  describe('derived from order age', () => {
    it('is processing on the order day', () => {
      expect(getOrderStatus({ createdAt: daysAgo(0) }, NOW)).toBe('processing')
    })

    it('is still processing one day later', () => {
      expect(getOrderStatus({ createdAt: daysAgo(1) }, NOW)).toBe('processing')
    })

    it('is shipped at the in-transit threshold', () => {
      expect(getOrderStatus({ createdAt: daysAgo(2) }, NOW)).toBe('shipped')
    })

    it('is still shipped the day before delivery', () => {
      expect(getOrderStatus({ createdAt: daysAgo(4) }, NOW)).toBe('shipped')
    })

    it('is delivered at the delivered threshold', () => {
      expect(getOrderStatus({ createdAt: daysAgo(5) }, NOW)).toBe('delivered')
    })

    it('stays delivered long after', () => {
      expect(getOrderStatus({ createdAt: daysAgo(30) }, NOW)).toBe('delivered')
    })
  })

  describe('statusOverride', () => {
    it('wins over a delivered-age order', () => {
      expect(
        getOrderStatus({ createdAt: daysAgo(30), statusOverride: 'returned' }, NOW),
      ).toBe('returned')
    })

    it('wins over a processing-age order', () => {
      expect(
        getOrderStatus({ createdAt: daysAgo(0), statusOverride: 'cancelled' }, NOW),
      ).toBe('cancelled')
    })
  })

  describe('DELIVERY_TIMELINE_DAYS', () => {
    it('matches the DeliveryTracker step offsets', () => {
      expect(DELIVERY_TIMELINE_DAYS).toEqual({ inTransit: 2, delivered: 5 })
    })
  })
})
