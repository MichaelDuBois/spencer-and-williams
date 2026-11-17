'use client'

import { useCallback, useState } from 'react'

import { useCart } from '@/hooks/useCart'
import { useInsightsEvents } from '@/hooks/useInsightsEvents'
import type { ProductRecommendModel } from '@/hooks/useRecommend'
import type { AddToCartSurface } from '@/lib/analytics/track'
import type { CartProduct } from '@/stores/cart'
import { isCartQuantity } from '@/utilities/cartValidation'

interface AddToCartOptions {
  queryID?: string
}

export interface PreparedCartProduct {
  product: CartProduct
  price: number
  discount: number
  isCurrent: () => boolean
}

export type PrepareCartProduct = (
  product: CartProduct,
) => Promise<PreparedCartProduct>

export interface UseAddToCartOptions {
  surface: AddToCartSurface
  model?: ProductRecommendModel
  prepareProduct?: PrepareCartProduct
}

export const useAddToCart = ({
  surface,
  model,
  prepareProduct,
}: UseAddToCartOptions) => {
  const { addItem } = useCart()
  const { sendAddToCartEvent } = useInsightsEvents()
  const [quantity, setQuantity] = useState(1)

  const addToCart = useCallback(
    (product: CartProduct, { queryID }: AddToCartOptions = {}) => {
      if (!isCartQuantity(quantity)) throw new Error('Choose a valid quantity.')
      const add = (prepared?: PreparedCartProduct) => {
        if (prepared && !prepared.isCurrent())
          throw new Error('Your selection changed. Please try again.')
        const baseProduct = prepared?.product ?? product
        if (
          prepared &&
          !Number.isSafeInteger(Math.round(prepared.price * 100) * quantity)
        )
          throw new Error('Choose a smaller quantity.')
        const isAccepted = addItem({
          objectID: baseProduct.objectID,
          name: baseProduct.name,
          image: baseProduct.image,
          price: baseProduct.price,
          brand: baseProduct.brand,
          quantity,
          queryID,
        })
        if (!isAccepted) return
        sendAddToCartEvent(
          {
            objectID: baseProduct.objectID,
            queryID,
            price: prepared?.price ?? baseProduct.price,
            quantity,
            ...(prepared ? { discount: prepared.discount } : {}),
          },
          { surface, model },
        )
      }
      return prepareProduct ? prepareProduct(product).then(add) : add()
    },
    [addItem, sendAddToCartEvent, quantity, prepareProduct, surface, model],
  )

  return { quantity, setQuantity, addToCart }
}
