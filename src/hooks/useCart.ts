'use client'

import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { getCartAtom, type CartItem, type CartProduct } from '@/stores/cart'
import { isCartProduct, isCartQuantity } from '@/utilities/cartValidation'

interface AddItemInput extends CartProduct {
  quantity?: number
  queryID?: string
}

export const useCart = () => {
  const config = useActiveConfig()
  const vertical = config?.slug ?? 'default'
  const appId = config?.algolia.appId
  const [cart, setCart] = useAtom(getCartAtom(vertical))

  // Invalid input is skipped rather than thrown: this hook is shared by every
  // vertical and is called from plain event handlers that cannot catch.
  const addItem = useCallback(
    (item: AddItemInput) => {
      const quantity = item.quantity ?? 1
      if (!isCartProduct(item) || !isCartQuantity(quantity)) return false
      const queryID = appId ? item.queryID : undefined
      const attribution = queryID ? { queryID, queryAppId: appId } : {}
      let isAccepted = false
      setCart((prev) => {
        const existingIndex = prev.items.findIndex(
          (i) => i.objectID === item.objectID,
        )

        if (existingIndex >= 0) {
          const existing = prev.items[existingIndex]
          const mergedQuantity = existing.quantity + quantity
          if (!isCartQuantity(mergedQuantity)) return prev
          isAccepted = true
          const updatedItems = [...prev.items]
          updatedItems[existingIndex] = {
            ...existing,
            quantity: mergedQuantity,
            ...(queryID && (!existing.queryID || existing.queryAppId !== appId)
              ? attribution
              : {}),
          }
          return { items: updatedItems, updatedAt: Date.now() }
        }

        const newItem: CartItem = {
          objectID: item.objectID,
          name: item.name,
          image: item.image,
          price: item.price,
          brand: item.brand,
          quantity,
          ...attribution,
        }
        isAccepted = true
        return { items: [...prev.items, newItem], updatedAt: Date.now() }
      })
      return isAccepted
    },
    [appId, setCart],
  )

  const removeItem = useCallback(
    (objectID: string) => {
      setCart((prev) => {
        return {
          items: prev.items.filter((i) => i.objectID !== objectID),
          updatedAt: Date.now(),
        }
      })
    },
    [setCart],
  )

  const updateQuantity = useCallback(
    (objectID: string, quantity: number) => {
      if (Number.isFinite(quantity) && quantity <= 0) {
        removeItem(objectID)
        return
      }

      if (!isCartQuantity(quantity)) return
      setCart((prev) => {
        return {
          items: prev.items.map((i) =>
            i.objectID === objectID ? { ...i, quantity } : i,
          ),
          updatedAt: Date.now(),
        }
      })
    },
    [setCart, removeItem],
  )

  const clearCart = useCallback(() => {
    setCart({ items: [], updatedAt: Date.now() })
  }, [setCart])

  const totalItems = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  )

  const totalPrice = useMemo(
    () =>
      cart.items.reduce(
        (sum, item) => sum + (item.price ?? 0) * item.quantity,
        0,
      ),
    [cart.items],
  )

  return {
    items: cart.items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
}
