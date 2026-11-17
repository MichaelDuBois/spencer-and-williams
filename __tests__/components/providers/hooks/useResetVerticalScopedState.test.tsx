import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useResetVerticalScopedState } from '@/components/providers/hooks/useResetVerticalScopedState'
import {
  demoOptionsStore,
  neuralSearchEnabledAtom,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'
import {
  geoSearchStateAtom,
  geoSearchStore,
  resetGeoSearchStateAtom,
} from '@/stores/geoSearch'
import {
  groceryDeliveryMethodAtom,
  groceryDeliveryMethodStore,
  resetGroceryDeliveryMethodAtom,
} from '@/stores/groceryDeliveryMethod'
import {
  activePersonaAtom,
  personalizationStore,
  resetPersonalizationAtom,
} from '@/stores/personalization'
import type { Persona } from '@/types'

const persona = {
  type: 'persona',
  id: 'p1',
  label: 'Persona One',
  description: '',
  token: 'token-1',
  affinities: {},
  optionalFilters: [],
} satisfies Persona

const seedState = () => {
  personalizationStore.set(activePersonaAtom, persona)
  demoOptionsStore.set(neuralSearchEnabledAtom, false)
  groceryDeliveryMethodStore.set(groceryDeliveryMethodAtom, 'pickup')
  geoSearchStore.set(geoSearchStateAtom, {
    mode: 'boundingBox',
    center: { lat: 1, lng: 2 },
    boundingBox: null,
  })
}

describe('useResetVerticalScopedState', () => {
  beforeEach(() => {
    personalizationStore.set(resetPersonalizationAtom)
    demoOptionsStore.set(resetDemoOptionsAtom)
    groceryDeliveryMethodStore.set(resetGroceryDeliveryMethodAtom)
    geoSearchStore.set(resetGeoSearchStateAtom)
  })

  it('resets the pinned stores when the slug changes', () => {
    const { rerender } = renderHook(
      ({ slug }: { slug: string }) => useResetVerticalScopedState(slug),
      { initialProps: { slug: 'ecommerce' } },
    )

    seedState()

    rerender({ slug: 'fashion' })

    expect(personalizationStore.get(activePersonaAtom)).toBeNull()
    expect(demoOptionsStore.get(neuralSearchEnabledAtom)).toBe(true)
    expect(groceryDeliveryMethodStore.get(groceryDeliveryMethodAtom)).toBe(
      'delivery',
    )
    expect(geoSearchStore.get(geoSearchStateAtom)).toEqual({
      mode: 'radius',
      center: null,
      boundingBox: null,
    })
  })

  it('leaves the pinned stores alone when the slug is unchanged', () => {
    const { rerender } = renderHook(
      ({ slug }: { slug: string }) => useResetVerticalScopedState(slug),
      { initialProps: { slug: 'ecommerce' } },
    )

    seedState()

    rerender({ slug: 'ecommerce' })

    expect(personalizationStore.get(activePersonaAtom)).toEqual(persona)
    expect(demoOptionsStore.get(neuralSearchEnabledAtom)).toBe(false)
    expect(groceryDeliveryMethodStore.get(groceryDeliveryMethodAtom)).toBe(
      'pickup',
    )
    expect(geoSearchStore.get(geoSearchStateAtom)).toEqual({
      mode: 'boundingBox',
      center: { lat: 1, lng: 2 },
      boundingBox: null,
    })
  })
})
