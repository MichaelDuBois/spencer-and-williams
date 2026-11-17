import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'

import { getOrderAtom } from '@/stores/order'

describe('getOrderAtom', () => {
  it('returns the same atom instance for a given vertical (cached)', () => {
    expect(getOrderAtom('ecommerce')).toBe(getOrderAtom('ecommerce'))
  })

  it('returns distinct atoms for different verticals', () => {
    expect(getOrderAtom('ecommerce')).not.toBe(getOrderAtom('fashion'))
  })

  it('initializes with a null order', () => {
    const store = createStore()
    expect(store.get(getOrderAtom('order-init-test'))).toBeNull()
  })
})
