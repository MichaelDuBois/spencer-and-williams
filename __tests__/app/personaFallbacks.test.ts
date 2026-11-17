import { describe, expect, it } from 'vitest'

import { PERSONAS as B2B_PERSONAS } from '@/app/b2b-warehouse/personas'
import { PERSONAS as ECOMMERCE_PERSONAS } from '@/app/ecommerce/personas'
import { PERSONAS as GROCERY_PERSONAS } from '@/app/grocery/personas'
import type { Persona } from '@/types'
import { parseOptionalFilters } from '@/utilities/parseOptionalFilters'


const cases: {
  persona: Persona | undefined
  unsupportedFacet: string
  unsupportedValues: string[]
}[] = [
  {
    persona: ECOMMERCE_PERSONAS.find((persona) => persona.id === 'john-smith'),
    unsupportedFacet: 'hierarchicalCategories.level1',
    unsupportedValues: ['Health & Household > Health Care'],
  },
  {
    persona: ECOMMERCE_PERSONAS.find((persona) => persona.id === 'alex-sapphire'),
    unsupportedFacet: 'hierarchicalCategories.level1',
    unsupportedValues: ['Health & Household > Vitamins, Minerals & Supplements'],
  },
  {
    persona: GROCERY_PERSONAS.find((persona) => persona.id === 'linda-gregson'),
    unsupportedFacet: 'hierarchicalCategories.level1',
    unsupportedValues: ['Dairy, Eggs & Plant-Based Alternatives > Plant-Based Milk'],
  },
  {
    persona: B2B_PERSONAS.find((persona) => persona.id === 'mike-anderson'),
    unsupportedFacet: 'hierarchicalCategories.level1',
    unsupportedValues: ['Hand Tools > Wrenches', 'Hand Tools > Pliers', 'Hand Tools > Files'],
  },
]

describe('trained persona fallback affinities', () => {
  it.each(cases)(
    'does not reintroduce unsupported fallback values for $persona.label',
    ({ persona, unsupportedFacet, unsupportedValues }) => {
      expect(persona).toBeDefined()
      if (!persona) return

      const configured = persona.affinities[unsupportedFacet] ?? []
      const filters = parseOptionalFilters(persona.optionalFilters)[unsupportedFacet] ?? {}
      for (const value of unsupportedValues) {
        expect(configured).not.toContain(value)
        expect(filters).not.toHaveProperty(value)
      }
    },
  )
})
