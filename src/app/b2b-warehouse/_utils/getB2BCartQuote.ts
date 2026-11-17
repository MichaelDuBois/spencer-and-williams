import {
  isB2BProductEligible,
  type B2BCustomerGroupPolicy,
} from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { getCustomerGroupPrice } from '@/app/b2b-warehouse/_utils/customerGroupPricing'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import type { B2BWarehouseHitTemplate } from '@/app/b2b-warehouse/types'
import type { CartItem } from '@/stores/cart'
import type { OrderItem } from '@/stores/order'
import { isCartProduct, isCartQuantity } from '@/utilities/cartValidation'

export const getB2BCartQuote = (
  items: CartItem[],
  products: Record<string, unknown>[],
  policy: B2BCustomerGroupPolicy,
  template: B2BWarehouseHitTemplate,
) => {
  const lines = items.map((item) => {
    const raw = products.find((product) => product.objectID === item.objectID)
    if (!raw || policy.status !== 'ready' || !isB2BProductEligible(raw, policy))
      return { item, status: 'unavailable' as const }
    const product = getB2BWarehouseProductHitValues(
      raw,
      template,
      'b2b-warehouse',
    )
    const price = getCustomerGroupPrice(product.price, policy.discount)
    if (!price) return { item, status: 'unpriced' as const }
    if (!isCartProduct(product)) return { item, status: 'unavailable' as const }
    if (
      !isCartQuantity(item.quantity) ||
      !Number.isSafeInteger(price.netUnitCents * item.quantity) ||
      !Number.isSafeInteger(price.baseUnitCents * item.quantity)
    )
      return { item, status: 'invalid-quantity' as const }
    const orderItem: OrderItem = {
      ...item,
      name: product.name,
      image: product.image,
      brand: product.brand,
      price: price.netUnitCents / 100,
      basePrice: price.baseUnitCents / 100,
      discount: price.discountUnitCents / 100,
    }
    return {
      item,
      status: 'eligible' as const,
      price,
      orderItem,
      lineTotalCents: price.netUnitCents * item.quantity,
    }
  })
  const subtotalCents = lines.reduce(
    (sum, line) => sum + (line.lineTotalCents ?? 0),
    0,
  )
  return {
    lines,
    subtotalCents,
    canCheckout:
      items.length > 0 &&
      lines.every((line) => line.status === 'eligible') &&
      Number.isSafeInteger(subtotalCents),
    orderItems: lines.flatMap((line) =>
      line.orderItem ? [line.orderItem] : [],
    ),
  }
}
