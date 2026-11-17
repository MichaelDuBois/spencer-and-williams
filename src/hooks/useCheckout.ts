'use client'

import { useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCart } from '@/hooks/useCart'
import { useInsightsEvents } from '@/hooks/useInsightsEvents'
import { useOrderHistory } from '@/hooks/useOrderHistory'
import { getOrderAtom, type Order, type OrderItem } from '@/stores/order'

const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SW-${timestamp}-${random}`
}

export interface CheckoutSnapshot {
  items: OrderItem[]
  subtotal: number
}

export interface CheckoutOptions {
  canCheckout: boolean
  getSnapshot: () => CheckoutSnapshot | null
  getFreshSnapshot?: () => Promise<CheckoutSnapshot | null>
}

export const useCheckout = (
  basePath: string = '/ecommerce',
  options?: CheckoutOptions,
) => {
  const router = useRouter()
  const config = useActiveConfig()
  const vertical = config?.slug ?? 'default'
  const appId = config?.algolia.appId
  const { items, totalPrice, clearCart } = useCart()
  const { sendPurchaseEvent } = useInsightsEvents()
  const setOrder = useSetAtom(getOrderAtom(vertical))
  const { addOrderToHistory } = useOrderHistory()
  const isCheckingOutRef = useRef(false)

  const checkout = useCallback(() => {
    if (isCheckingOutRef.current) return
    if (options && !options.canCheckout) return
    const completeCheckout = (snapshot: CheckoutSnapshot | null) => {
      if (!snapshot || snapshot.items.length === 0) return

      const orderId = generateOrderId()
      const shipping = 0 // Free shipping

      const order: Order = {
        id: orderId,
        items: snapshot.items.map((item) => {
          return { ...item }
        }),
        subtotal: snapshot.subtotal,
        shipping,
        total: snapshot.subtotal + shipping,
        createdAt: Date.now(),
      }

      setOrder(order)
      addOrderToHistory(order)
      sendPurchaseEvent(
        snapshot.items.map((item) => {
          return {
            objectID: item.objectID,
            price: item.price,
            quantity: item.quantity,
            ...(item.discount !== undefined ? { discount: item.discount } : {}),
            queryID:
              appId &&
              item.queryAppId === appId &&
              typeof item.queryID === 'string'
                ? item.queryID
                : undefined,
          }
        }),
      )
      clearCart()
      router.push(`${basePath}/order/${orderId}`)
    }

    if (options?.getFreshSnapshot) {
      isCheckingOutRef.current = true

      return options
        .getFreshSnapshot()
        .then(completeCheckout)
        .finally(() => {
          isCheckingOutRef.current = false
        })
    }

    completeCheckout(
      options ? options.getSnapshot() : { items, subtotal: totalPrice },
    )
  }, [
    appId,
    items,
    options,
    totalPrice,
    setOrder,
    addOrderToHistory,
    sendPurchaseEvent,
    clearCart,
    router,
    basePath,
  ])

  return {
    checkout,
    canCheckout: options ? options.canCheckout : items.length > 0,
  }
}
