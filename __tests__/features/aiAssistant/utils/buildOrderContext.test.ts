import { describe, expect, it } from 'vitest'

import {
  buildOrderContextNote,
  toOrderContext,
} from '@/features/aiAssistant/utils/buildOrderContext'
import type { Order } from '@/stores/order'

const order: Order = {
  id: 'SW-TEST-0001',
  items: [
    {
      objectID: 'shoe-1',
      name: 'Trail Shoe',
      image: '/trail-shoe.jpg',
      price: 120,
      quantity: 2,
      brand: 'Spencer & Williams',
      basePrice: 150,
      discount: 30,
    },
  ],
  subtotal: 240,
  shipping: 0,
  total: 240,
  createdAt: 1_750_000_000_000,
}

describe('order context transforms', () => {
  it('projects an order to the safe assistant context fields', () => {
    expect(toOrderContext(order)).toEqual({
      orderId: 'SW-TEST-0001',
      items: [
        {
          objectID: 'shoe-1',
          name: 'Trail Shoe',
          image: '/trail-shoe.jpg',
          price: 120,
        },
      ],
    })
  })

  it('formats order context data as an assistant note', () => {
    expect(
      buildOrderContextNote({
        orderId: 'SW-TEST-0001',
        items: [
          { objectID: 'shoe-1', name: 'Trail Shoe' },
          { objectID: 'sock-1', name: 'Hiking Socks' },
        ],
      }),
    ).toBe(
      '[Order context: Order SW-TEST-0001 containing: Trail Shoe, Hiking Socks]',
    )
  })
})
