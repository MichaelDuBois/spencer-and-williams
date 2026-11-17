import { atomWithStorage } from 'jotai/utils'

import type { CartItem } from '@/stores/cart'
import type { Order } from '@/stores/order'
import { createSessionJSONStorage } from '@/stores/sessionJSONStorage'
import { DAY_MS, type OrderStatusOverride } from '@/utilities/orderStatus'

export interface OrderHistoryEntry extends Order {
  statusOverride?: OrderStatusOverride
}

/** One bucket per persona id; GUEST_PERSONA_KEY when no persona is active. */
export type OrderHistoryMap = Record<string, OrderHistoryEntry[]>

export interface OrderSeed {
  daysAgo: number
  statusOverride?: OrderStatusOverride
  items: CartItem[]
}

export type OrderHistorySeeds = Record<string, OrderSeed[]>

export const GUEST_PERSONA_KEY = 'guest'

const getStorageKey = (vertical: string) =>
  `spencer-williams-${vertical}-order-history`

const startOfDay = (timestamp: number): number =>
  new Date(timestamp).setHours(0, 0, 0, 0)

// Six base-36 digits per id segment; the modulus keeps the running hash inside
// that width and non-negative, so the result never needs truncating or sign
// handling.
const SEGMENT_MODULUS = 36 ** 6

const hashSegment = (input: string): string => {
  let hash = 0
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) % SEGMENT_MODULUS
  }
  return hash.toString(36).toUpperCase().padStart(6, '0')
}

// Deterministic so a seeded order keeps its id across reloads, while still
// looking like the SW-XXXXXX-YYYYYY ids useCheckout generates.
const buildSeedOrderId = (personaKey: string, index: number): string =>
  `SW-${hashSegment(`${personaKey}-${index}`)}-${hashSegment(`${index}-${personaKey}`)}`

export const expandOrderSeeds = (
  seeds: OrderHistorySeeds,
  now: number = Date.now(),
): OrderHistoryMap => {
  const today = startOfDay(now)

  return Object.fromEntries(
    Object.entries(seeds).map(([personaKey, personaSeeds]) => [
      personaKey,
      personaSeeds.map((seed, index) => {
        const subtotal = seed.items.reduce(
          (sum, item) => sum + (item.price ?? 0) * item.quantity,
          0,
        )

        return {
          id: buildSeedOrderId(personaKey, index),
          items: seed.items,
          subtotal,
          shipping: 0,
          total: subtotal,
          createdAt: today - seed.daysAgo * DAY_MS,
          ...(seed.statusOverride
            ? { statusOverride: seed.statusOverride }
            : {}),
        }
      }),
    ]),
  )
}

const orderHistoryStorage = createSessionJSONStorage<OrderHistoryMap>()

// Writes an already-expanded map to sessionStorage once, without clobbering a
// payload an earlier call (or a real checkout) already put there. This keeps the
// seeds visible in DevTools even when the presenter never checks out. A plain
// storage write, not React state — `react-hooks/set-state-in-effect` forbids
// seeding from an effect. No-op during SSR, where sessionStorage does not exist.
const persistSeedMap = (vertical: string, map: OrderHistoryMap): void => {
  if (typeof window === 'undefined') return

  const key = getStorageKey(vertical)
  if (sessionStorage.getItem(key) !== null) return

  sessionStorage.setItem(key, JSON.stringify(map))
}

const orderHistoryAtomCache = new Map<
  string,
  ReturnType<typeof atomWithStorage<OrderHistoryMap>>
>()

/**
 * Cached per vertical, so `seeds` only takes effect on the first call for a
 * given vertical — one config per vertical makes that unambiguous.
 */
export const getOrderHistoryAtom = (
  vertical: string,
  seeds: OrderHistorySeeds = {},
) => {
  if (!orderHistoryAtomCache.has(vertical)) {
    // Expand once and share between the storage seed and the atom's initial
    // value, so the two agree on ids/timestamps and we don't rebuild the map
    // (or read the clock) twice.
    const seedMap = expandOrderSeeds(seeds)
    persistSeedMap(vertical, seedMap)
    orderHistoryAtomCache.set(
      vertical,
      atomWithStorage<OrderHistoryMap>(
        getStorageKey(vertical),
        seedMap,
        orderHistoryStorage,
        { getOnInit: true },
      ),
    )
  }

  return orderHistoryAtomCache.get(vertical)!
}
