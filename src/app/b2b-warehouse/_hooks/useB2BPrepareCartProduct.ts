'use client'

import { useB2BCartScope } from '@/app/b2b-warehouse/_hooks/useB2BCartScope'
import { fetchB2BCartProducts } from '@/app/b2b-warehouse/_utils/fetchB2BCartProducts'
import { getB2BCartQuote } from '@/app/b2b-warehouse/_utils/getB2BCartQuote'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import type { PrepareCartProduct } from '@/hooks/useAddToCart'
import { isCartProduct } from '@/utilities/cartValidation'

export const useB2BPrepareCartProduct = (
  signal?: AbortSignal,
): PrepareCartProduct => {
  const scope = useB2BCartScope()
  const isCurrent = () => scope.isCurrent() && !signal?.aborted
  return async (product) => {
    const index = scope.config?.algolia.primaryIndex.name
    if (
      !isCurrent() ||
      !scope.client ||
      !index ||
      scope.policy.status !== 'ready' ||
      !isCartProduct(product)
    )
      throw new Error('Product unavailable. Please try again.')
    let products: Record<string, unknown>[]
    try {
      products = await fetchB2BCartProducts(
        scope.client,
        index,
        [product.objectID],
        scope.filters,
      )
    } catch {
      throw new Error('Unable to check this product. Please try again.')
    }
    if (!isCurrent())
      throw new Error('Your selection changed. Please try again.')
    const quote = getB2BCartQuote(
      [{ ...product, quantity: 1 }],
      products,
      scope.policy,
      b2bWarehouseConfig.algolia.primaryIndex.template!,
    )
    const line = quote.lines[0]
    if (!quote.canCheckout || !line.orderItem || !line.price)
      throw new Error(
        'This product is unavailable for your current group or warehouse, or has no valid price.',
      )
    return {
      product: { ...line.orderItem, price: line.price.baseUnitCents / 100 },
      price: line.price.netUnitCents / 100,
      discount: line.price.discountUnitCents / 100,
      isCurrent,
    }
  }
}
