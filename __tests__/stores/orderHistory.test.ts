import { createStore } from 'jotai'
import { beforeEach, describe, expect, it } from 'vitest'

import type { CartItem } from '@/stores/cart'
import {
  expandOrderSeeds,
  getOrderHistoryAtom,
  GUEST_PERSONA_KEY,
  type OrderHistorySeeds,
} from '@/stores/orderHistory'
import { DAY_MS } from '@/utilities/orderStatus'

const NOW = new Date('2026-07-30T15:30:00Z').getTime()

const ITEM: CartItem = {
  objectID: 'p1',
  name: 'Silk Scarf',
  image: 'https://cdn.example.com/scarf.webp',
  price: 40,
  brand: 'Acme',
  quantity: 2,
}

const SEEDS: OrderHistorySeeds = {
  'emily-topaz': [
    { daysAgo: 0, items: [ITEM] },
    { daysAgo: 12, statusOverride: 'returned', items: [ITEM] },
  ],
}

describe('expandOrderSeeds', () => {
  it('computes subtotal and total from item price times quantity', () => {
    const map = expandOrderSeeds(SEEDS, NOW)

    expect(map['emily-topaz'][0].subtotal).toBe(80)
    expect(map['emily-topaz'][0].total).toBe(80)
    expect(map['emily-topaz'][0].shipping).toBe(0)
  })

  it('pins createdAt to the start of the day, daysAgo days back', () => {
    const map = expandOrderSeeds(SEEDS, NOW)
    const startOfToday = new Date(NOW).setHours(0, 0, 0, 0)

    expect(map['emily-topaz'][0].createdAt).toBe(startOfToday)
    expect(map['emily-topaz'][1].createdAt).toBe(startOfToday - 12 * DAY_MS)
  })

  it('carries statusOverride through and omits it when absent', () => {
    const map = expandOrderSeeds(SEEDS, NOW)

    expect(map['emily-topaz'][1].statusOverride).toBe('returned')
    expect(map['emily-topaz'][0]).not.toHaveProperty('statusOverride')
  })

  it('generates deterministic, real-looking order ids', () => {
    const first = expandOrderSeeds(SEEDS, NOW)['emily-topaz'][0].id
    const second = expandOrderSeeds(SEEDS, NOW)['emily-topaz'][0].id

    expect(first).toBe(second)
    expect(first).toMatch(/^SW-[0-9A-Z]{6}-[0-9A-Z]{6}$/)
  })

  it('gives different personas different order ids', () => {
    const map = expandOrderSeeds(
      { a: [{ daysAgo: 0, items: [ITEM] }], b: [{ daysAgo: 0, items: [ITEM] }] },
      NOW,
    )

    expect(map.a[0].id).not.toBe(map.b[0].id)
  })

  it('returns an empty map for empty seeds', () => {
    expect(expandOrderSeeds({}, NOW)).toEqual({})
  })
})

describe('getOrderHistoryAtom', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('writes the expanded seeds into sessionStorage', () => {
    getOrderHistoryAtom('seed-write-test', SEEDS)

    const raw = sessionStorage.getItem(
      'spencer-williams-seed-write-test-order-history',
    )
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)['emily-topaz']).toHaveLength(2)
  })

  it('does not overwrite an existing session payload', () => {
    const key = 'spencer-williams-seed-keep-test-order-history'
    sessionStorage.setItem(key, JSON.stringify({ guest: [] }))

    getOrderHistoryAtom('seed-keep-test', SEEDS)

    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual({ guest: [] })
  })

  it('uses sessionStorage, not localStorage', () => {
    getOrderHistoryAtom('seed-storage-test', SEEDS)

    expect(
      localStorage.getItem('spencer-williams-seed-storage-test-order-history'),
    ).toBeNull()
  })

  it('returns the same atom instance for a given vertical (cached)', () => {
    expect(getOrderHistoryAtom('ecommerce')).toBe(getOrderHistoryAtom('ecommerce'))
  })

  it('returns distinct atoms for different verticals', () => {
    expect(getOrderHistoryAtom('ecommerce')).not.toBe(
      getOrderHistoryAtom('fashion'),
    )
  })

  it('initializes with the expanded seed map', () => {
    const store = createStore()
    const atom = getOrderHistoryAtom('atom-seed-test', SEEDS)

    expect(store.get(atom)['emily-topaz']).toHaveLength(2)
  })

  it('initializes empty when no seeds are supplied', () => {
    const store = createStore()

    expect(store.get(getOrderHistoryAtom('atom-empty-test'))).toEqual({})
  })

  it('exposes the guest bucket key', () => {
    expect(GUEST_PERSONA_KEY).toBe('guest')
  })
})
