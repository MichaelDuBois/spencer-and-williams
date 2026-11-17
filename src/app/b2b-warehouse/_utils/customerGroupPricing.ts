export interface CustomerGroupPrice {
  baseUnitCents: number
  netUnitCents: number
  discountUnitCents: number
}

export const isValidDiscountRate = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1

const roundCents = (price: number): number => {
  const cents = price * 100
  return Math.round(cents + Number.EPSILON * Math.abs(cents))
}

export const getCustomerGroupPrice = (
  basePrice: number | undefined,
  discount: number,
): CustomerGroupPrice | undefined => {
  if (
    basePrice === undefined ||
    !Number.isFinite(basePrice) ||
    basePrice < 0 ||
    !isValidDiscountRate(discount)
  ) {
    return undefined
  }

  const baseUnitCents = roundCents(basePrice)
  const netUnitCents = roundCents(basePrice * (1 - discount))
  if (
    !Number.isSafeInteger(baseUnitCents) ||
    !Number.isSafeInteger(netUnitCents)
  ) {
    return undefined
  }

  return {
    baseUnitCents,
    netUnitCents,
    discountUnitCents: baseUnitCents - netUnitCents,
  }
}
