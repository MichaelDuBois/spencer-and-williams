import { describe, expect, it } from 'vitest'

import { ORDER_HISTORY_SEEDS as B2B_WAREHOUSE_SEEDS } from '@/app/b2b-warehouse/orderHistorySeeds'
import { PERSONAS as B2B_WAREHOUSE_PERSONAS } from '@/app/b2b-warehouse/personas'
import { ORDER_HISTORY_SEEDS as ECOMMERCE_SEEDS } from '@/app/ecommerce/orderHistorySeeds'
import { PERSONAS as ECOMMERCE_PERSONAS } from '@/app/ecommerce/personas'
import { ORDER_HISTORY_SEEDS as ELECTRONICS_SEEDS } from '@/app/electronics/orderHistorySeeds'
import { PERSONAS as ELECTRONICS_PERSONAS } from '@/app/electronics/personas'
import { ORDER_HISTORY_SEEDS as FASHION_SEEDS } from '@/app/fashion/orderHistorySeeds'
import { PERSONAS as FASHION_PERSONAS } from '@/app/fashion/personas'
import { ORDER_HISTORY_SEEDS as FURNISHING_SEEDS } from '@/app/furnishing/orderHistorySeeds'
import { PERSONAS as FURNISHING_PERSONAS } from '@/app/furnishing/personas'
import { ORDER_HISTORY_SEEDS as GROCERY_SEEDS } from '@/app/grocery/orderHistorySeeds'
import { PERSONAS as GROCERY_PERSONAS } from '@/app/grocery/personas'
import { GUEST_PERSONA_KEY } from '@/stores/orderHistory'
import type { OrderHistorySeeds } from '@/stores/orderHistory'
import type { Persona } from '@/types'

interface VerticalFixture {
  vertical: string
  personas: Persona[]
  seeds: OrderHistorySeeds
}

const VERTICALS: VerticalFixture[] = [
  {
    vertical: 'b2b-warehouse',
    personas: B2B_WAREHOUSE_PERSONAS,
    seeds: B2B_WAREHOUSE_SEEDS,
  },
  { vertical: 'ecommerce', personas: ECOMMERCE_PERSONAS, seeds: ECOMMERCE_SEEDS },
  {
    vertical: 'electronics',
    personas: ELECTRONICS_PERSONAS,
    seeds: ELECTRONICS_SEEDS,
  },
  { vertical: 'fashion', personas: FASHION_PERSONAS, seeds: FASHION_SEEDS },
  {
    vertical: 'furnishing',
    personas: FURNISHING_PERSONAS,
    seeds: FURNISHING_SEEDS,
  },
  { vertical: 'grocery', personas: GROCERY_PERSONAS, seeds: GROCERY_SEEDS },
]

describe('order history seeds', () => {
  it.each(VERTICALS)(
    '$vertical: seed keys are exactly the persona ids',
    ({ personas, seeds }) => {
      const personaIds = new Set(personas.map((persona) => persona.id))
      const seedKeys = new Set(Object.keys(seeds))

      const personasMissingSeeds = [...personaIds].filter(
        (id) => !seedKeys.has(id),
      )
      const seedsMissingPersonas = [...seedKeys].filter(
        (key) => !personaIds.has(key),
      )

      expect(personasMissingSeeds).toEqual([])
      expect(seedsMissingPersonas).toEqual([])
    },
  )

  it.each(VERTICALS)('$vertical: guest is never a seed key', ({ seeds }) => {
    expect(Object.keys(seeds)).not.toContain(GUEST_PERSONA_KEY)
  })

  it.each(VERTICALS)(
    '$vertical: seeded orders contain distinct products with usable details',
    ({ seeds }) => {
      for (const orders of Object.values(seeds)) {
        for (const order of orders) {
          expect(order.items.length).toBeGreaterThan(0)
          expect(new Set(order.items.map((item) => item.objectID)).size).toBe(
            order.items.length,
          )
          for (const item of order.items) {
            expect(item.objectID).toBeTruthy()
            expect(item.name).toBeTruthy()
            expect(item.image).toMatch(/^https:\/\//)
            expect(item.price).toBeGreaterThanOrEqual(0)
            expect(item.quantity).toBeGreaterThan(0)
          }
        }
      }
    },
  )

  it('keeps Alex’s ecommerce clothing order together without thermal paste', () => {
    const orders = ECOMMERCE_SEEDS['alex-sapphire']
    expect(orders[0].items.map((item) => item.objectID)).toEqual([
      'B0018OY3H8',
      'B07TNRYJHN',
    ])
    expect(orders.flatMap((order) => order.items.map((item) => item.objectID)))
      .not.toContain('B07LDRVFBH')
  })
})
