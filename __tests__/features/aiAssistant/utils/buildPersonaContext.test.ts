import { describe, expect, it } from 'vitest'

import { buildPersonaContext } from '@/features/aiAssistant/utils/buildPersonaContext'
import type { CartItem } from '@/stores/cart'
import type { OrderHistoryEntry } from '@/stores/orderHistory'
import type { Persona } from '@/types'

const persona: Persona = {
  id: 'sports-fan',
  label: 'Sports Fan',
  description: 'Into sportswear & outdoor gear',
  token: 'persona-sports-fan',
  affinities: {
    brand: ['Nike', 'adidas'],
    'hierarchicalCategories.level1': ['Sports & Outdoors'],
  },
  optionalFilters: [],
}

const orders: OrderHistoryEntry[] = [
  {
    id: 'SW-ABC123-DEF456',
    items: [{ objectID: '1', name: 'Running Shoes', quantity: 1, price: 80 }],
    subtotal: 80,
    shipping: 0,
    total: 80,
    createdAt: new Date('2026-07-01').getTime(),
  },
]

const cart: CartItem[] = [
  { objectID: '2', name: 'Water Bottle', quantity: 2, price: 15 },
]

describe('buildPersonaContext', () => {
  it('includes label, affinities, orders, cart, and vertical scope for a persona', () => {
    const result = buildPersonaContext({
      mode: 'persona',
      persona,
      orders,
      cart,
      currentVertical: 'ecommerce',
    })

    expect(result).not.toBeNull()
    expect(result).toContain('Sports Fan')
    expect(result).toContain('Nike')
    expect(result).toContain('adidas')
    expect(result).toContain('SW-ABC123-DEF456')
    expect(result).toContain('Running Shoes')
    expect(result).toContain('Water Bottle x2')
    // Store-scoping instruction is always present.
    expect(result).toContain('ecommerce')
    expect(result).toMatch(/ONLY the ecommerce store/i)
  })

  it('for anonymous shoppers includes cart and orders but no persona identity', () => {
    const result = buildPersonaContext({
      mode: 'anonymous',
      persona,
      orders,
      cart,
      currentVertical: 'ecommerce',
    })

    expect(result).not.toBeNull()
    expect(result).toContain('Water Bottle x2')
    expect(result).toContain('SW-ABC123-DEF456')
    // No persona identity/PII leaks in anonymous mode.
    expect(result).not.toContain('Sports Fan')
    expect(result).not.toContain('Into sportswear & outdoor gear')
    expect(result).not.toContain('Nike')
    expect(result).toContain('ecommerce')
  })

  it('treats realtime as anonymous for identity', () => {
    const result = buildPersonaContext({
      mode: 'realtime',
      persona,
      orders,
      cart,
      currentVertical: 'ecommerce',
    })

    expect(result).not.toContain('Sports Fan')
    expect(result).not.toContain('Nike')
    expect(result).toContain('Water Bottle x2')
  })

  it('always includes the current vertical, even with empty cart and no orders', () => {
    const result = buildPersonaContext({
      mode: 'anonymous',
      persona: null,
      orders: [],
      cart: [],
      currentVertical: 'travel',
    })

    expect(result).not.toBeNull()
    expect(result).toContain('travel')
    expect(result).toMatch(/ONLY the travel store/i)
  })

  it('returns null when there is no current vertical', () => {
    const result = buildPersonaContext({
      mode: 'anonymous',
      persona: null,
      orders: [],
      cart: [],
      currentVertical: '',
    })

    expect(result).toBeNull()
  })
})
