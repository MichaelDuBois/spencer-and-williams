import { describe, expect, it } from 'vitest'

import {
  getCustomerGroupPrice,
  isValidDiscountRate,
} from '@/app/b2b-warehouse/_utils/customerGroupPricing'

describe('customer group unit pricing', () => {
  it.each([
    [0.15, 8500, 17000],
    [0.3, 7000, 14000],
  ])(
    'applies rate %s once, before quantity multiplication',
    (discount, netUnitCents, lineCents) => {
      const quote = getCustomerGroupPrice(100, discount)
      expect(quote).toEqual({
        baseUnitCents: 10000,
        netUnitCents,
        discountUnitCents: 10000 - netUnitCents,
      })
      expect(quote!.netUnitCents * 2).toBe(lineCents)
    },
  )

  it.each([
    [0, 10000],
    [1, 0],
  ])('supports discount boundary %s', (discount, netUnitCents) => {
    expect(getCustomerGroupPrice(100, discount)?.netUnitCents).toBe(
      netUnitCents,
    )
  })

  it('rounds the net unit price before multiplying by quantity', () => {
    const quote = getCustomerGroupPrice(15.9, 0.15)
    expect(quote).toEqual({
      baseUnitCents: 1590,
      netUnitCents: 1352,
      discountUnitCents: 238,
    })
    expect(quote!.netUnitCents * 3).toBe(4056)
  })

  it.each([
    [1.005, 0, 101],
    [10.075, 0, 1008],
    [1.005, 0.1, 90],
  ])(
    'handles fractional-cent rounding for %s at rate %s',
    (base, discount, netUnitCents) => {
      expect(getCustomerGroupPrice(base, discount)?.netUnitCents).toBe(
        netUnitCents,
      )
    },
  )

  it.each([undefined, NaN, Infinity, -1, Number.MAX_VALUE])(
    'does not quote an invalid or missing price %s',
    (price) => {
      expect(getCustomerGroupPrice(price, 0.15)).toBeUndefined()
    },
  )

  it.each([-0.1, 1.1, NaN, Infinity])(
    'does not quote an invalid discount %s',
    (discount) => {
      expect(getCustomerGroupPrice(100, discount)).toBeUndefined()
    },
  )

  it.each([null, undefined, '0.15', {}, false])(
    'rejects a non-numeric discount %j',
    (discount) => {
      expect(isValidDiscountRate(discount)).toBe(false)
    },
  )

  it('preserves an explicit zero price', () => {
    expect(getCustomerGroupPrice(0, 0.15)).toEqual({
      baseUnitCents: 0,
      netUnitCents: 0,
      discountUnitCents: 0,
    })
  })
})
