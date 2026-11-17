import { describe, expect, it } from 'vitest'

import { PERSONAS } from '@/app/ecommerce/personas'
import { getPersonalizationMode } from '@/utilities/getPersonalizationMode'

import { GROUP_0 } from '@tests/helpers/customerGroups'

describe('getPersonalizationMode', () => {
  it('is anonymous without a profile or realtime', () => {
    expect(
      getPersonalizationMode({ persona: null, realtimeEnabled: false }),
    ).toBe('anonymous')
  })

  it('is persona for a persona profile', () => {
    expect(
      getPersonalizationMode({ persona: PERSONAS[0], realtimeEnabled: false }),
    ).toBe('persona')
  })

  it('is customerGroup for a customer group profile', () => {
    expect(
      getPersonalizationMode({ persona: GROUP_0, realtimeEnabled: false }),
    ).toBe('customerGroup')
  })

  it('is realtime whenever realtime is enabled', () => {
    expect(
      getPersonalizationMode({ persona: PERSONAS[0], realtimeEnabled: true }),
    ).toBe('realtime')
  })
})
