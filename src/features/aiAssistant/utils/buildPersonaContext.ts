import type { PersonalizationMode } from '@/hooks/usePersonalization'
import type { CartItem } from '@/stores/cart'
import type { OrderHistoryEntry } from '@/stores/orderHistory'
import type { SelectableProfile } from '@/types'
import { getOrderStatus } from '@/utilities/orderStatus'

interface BuildPersonaContextArgs {
  mode: PersonalizationMode
  persona: SelectableProfile | null
  orders: OrderHistoryEntry[]
  cart: CartItem[]
  currentVertical: string
}

/** Compact "brand: A, B; category: C" summary from a persona's affinities. */
const summarizeAffinities = (affinities: Record<string, string[]>): string =>
  Object.entries(affinities)
    .filter(([, values]) => values.length > 0)
    .map(([key, values]) => `${key}: ${values.join(', ')}`)
    .join('; ')

const formatOrderDate = (createdAt: number): string =>
  new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

/** One compact line per order: id, date, status, items, total. */
const summarizeOrders = (orders: OrderHistoryEntry[]): string =>
  orders
    .map((order) => {
      const status = getOrderStatus({
        createdAt: order.createdAt,
        statusOverride: order.statusOverride,
      })
      const itemNames = order.items.map((item) => item.name).join(', ')
      return `${order.id} (${formatOrderDate(order.createdAt)}, ${status}): ${itemNames} — total $${order.total.toFixed(2)}`
    })
    .join(' | ')

/** Compact "name x2, name x1" summary of the current cart. */
const summarizeCart = (cart: CartItem[]): string =>
  cart.map((item) => `${item.name} x${item.quantity}`).join(', ')

/**
 * Builds a single plain-text `[Context: ...]` note describing the shopper's
 * situation for the agent. Persona mode carries identity, preferences, order
 * history, and cart; anonymous/realtime carry only the current-session cart and
 * guest order history (no persona identity or PII). The current vertical and a
 * store-scoping instruction are always included, so this returns non-null
 * whenever `currentVertical` is set.
 */
export const buildPersonaContext = ({
  mode,
  persona,
  orders,
  cart,
  currentVertical,
}: BuildPersonaContextArgs): string | null => {
  if (!currentVertical) return null

  const segments: string[] = [
    `The shopper is browsing the ${currentVertical} store.`,
    `When answering support/FAQ questions (return policy, delivery, shipping, etc.), apply ONLY the ${currentVertical} store's policies — never cite or mix in policies from other stores.`,
  ]

  if (mode === 'persona' && persona && persona.type !== 'customerGroup') {
    segments.push(`Shopper profile: ${persona.label} — ${persona.description}.`)

    const affinities = summarizeAffinities(persona.affinities)
    if (affinities) {
      segments.push(`Known preferences — ${affinities}.`)
    }
  }

  if (orders.length > 0) {
    segments.push(`Order history: ${summarizeOrders(orders)}.`)
  }

  if (cart.length > 0) {
    segments.push(`Current cart: ${summarizeCart(cart)}.`)
  }

  return `[Context: ${segments.join(' ')}]`
}
