'use client'

import { useAtomValue } from 'jotai'
import { useCallback, useLayoutEffect, useRef } from 'react'

import { buildPersonaContext } from '@/features/aiAssistant/utils/buildPersonaContext'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCart } from '@/hooks/useCart'
import { useOrderHistory } from '@/hooks/useOrderHistory'
import { usePersonalization } from '@/hooks/usePersonalization'
import type { OrderHistoryEntry } from '@/stores/orderHistory'
import {
  activePersonaAtom,
  personalizationStore,
} from '@/stores/personalization'

interface UseShopperContextReturn {
  /** Session order history, shared so callers don't read it a second time. */
  orders: OrderHistoryEntry[]
  personaKey: string
  /** Stable reader for the latest committed order history. */
  getOrders: () => OrderHistoryEntry[]
  /** Referentially stable reader for the current shopper context note. */
  getShopperContext: () => string | null
}

/**
 * Single source of the `[Context: ...]` note describing the shopper to an
 * assistant: persona, order history, cart, and the current vertical's store.
 *
 * A vertical that supplies its own viewer note replaces this one rather than
 * adding to it, so the agent gets a single description of the person.
 *
 * The reader is stable by design: `<Chat>` treats a new `context` function as a
 * new widget and resets the conversation, so the value lives in a ref.
 */
export const useShopperContext = (
  viewerContextOverride?: string | null,
): UseShopperContextReturn => {
  const config = useActiveConfig()
  const { mode } = usePersonalization()
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const { orders, personaKey } = useOrderHistory()
  const { items: cartItems } = useCart()

  const vertical = config?.slug ?? 'ecommerce'
  const ordersRef = useRef(orders)
  useLayoutEffect(() => {
    ordersRef.current = orders
  }, [orders])
  const getOrders = useCallback(() => ordersRef.current, [])

  const shopperContextRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    shopperContextRef.current =
      viewerContextOverride ??
      buildPersonaContext({
        mode,
        persona,
        orders,
        cart: cartItems,
        currentVertical: vertical,
      })
  }, [viewerContextOverride, mode, persona, orders, cartItems, vertical])

  const getShopperContext = useCallback(() => shopperContextRef.current, [])

  return { orders, personaKey, getOrders, getShopperContext }
}
