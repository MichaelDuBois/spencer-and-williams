import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useOrderHistory } from '@/hooks/useOrderHistory'
import type { OrderHistoryEntry } from '@/stores/orderHistory'
import type { Persona } from '@/types'

const PERSONA_A = { id: 'emily-topaz' } as Persona
const PERSONA_B = { id: 'michael-emerald' } as Persona

let activePersona: Persona | null = null

vi.mock('jotai', async () => {
  const actual = await vi.importActual<typeof import('jotai')>('jotai')
  return { ...actual, useAtomValue: () => activePersona }
})

const SEEDS = {
  'emily-topaz': [{ daysAgo: 0, items: [] }],
  'michael-emerald': [{ daysAgo: 3, items: [] }],
}

let slug = 'hook-test-a'

vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => {return {
    slug,
    features: { orderHistory: { enabled: true, seeds: SEEDS } },
  }},
}})

const buildEntry = (id: string): OrderHistoryEntry => {return {
  id,
  items: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  createdAt: Date.now(),
}}

describe('useOrderHistory', () => {
  beforeEach(() => {
    sessionStorage.clear()
    activePersona = null
  })

  describe('persona keying', () => {
    it('uses the guest key when no persona is active', () => {
      slug = 'hook-guest'
      const { result } = renderHook(() => useOrderHistory())

      expect(result.current.personaKey).toBe('guest')
    })

    it('uses the persona id when one is active', () => {
      slug = 'hook-persona-id'
      activePersona = PERSONA_A
      const { result } = renderHook(() => useOrderHistory())

      expect(result.current.personaKey).toBe('emily-topaz')
    })

    it('starts the guest bucket empty even though personas are seeded', () => {
      slug = 'hook-guest-empty'
      const { result } = renderHook(() => useOrderHistory())

      expect(result.current.orders).toEqual([])
    })

    it('exposes the active persona seeded orders', () => {
      slug = 'hook-seeded'
      activePersona = PERSONA_A
      const { result } = renderHook(() => useOrderHistory())

      expect(result.current.orders).toHaveLength(1)
    })
  })

  describe('addOrderToHistory', () => {
    it('prepends the new order so newest is first', () => {
      slug = 'hook-prepend'
      activePersona = PERSONA_A
      const { result } = renderHook(() => useOrderHistory())

      act(() => result.current.addOrderToHistory(buildEntry('SW-NEW')))

      expect(result.current.orders[0].id).toBe('SW-NEW')
      expect(result.current.orders).toHaveLength(2)
    })

    it('writes only into the active persona bucket', () => {
      slug = 'hook-isolation'
      activePersona = PERSONA_A
      const { result, rerender } = renderHook(() => useOrderHistory())

      act(() => result.current.addOrderToHistory(buildEntry('SW-EMILY')))

      activePersona = PERSONA_B
      rerender()

      expect(result.current.orders.map((o) => o.id)).not.toContain('SW-EMILY')
    })
  })

  describe('switching personas', () => {
    it('restores a persona live order after switching away and back', () => {
      slug = 'hook-switch-back'
      activePersona = PERSONA_A
      const { result, rerender } = renderHook(() => useOrderHistory())

      act(() => result.current.addOrderToHistory(buildEntry('SW-EMILY')))

      activePersona = PERSONA_B
      rerender()
      expect(result.current.orders.map((o) => o.id)).not.toContain('SW-EMILY')

      activePersona = PERSONA_A
      rerender()
      expect(result.current.orders[0].id).toBe('SW-EMILY')
    })
  })
})
