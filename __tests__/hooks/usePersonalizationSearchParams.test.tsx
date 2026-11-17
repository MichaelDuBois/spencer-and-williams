import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { usePersonalizationSearchParams } from '@/hooks/usePersonalizationSearchParams'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  personalizationStore,
  resetPersonalizationAtom,
  setPersonaModeAtom,
} from '@/stores/personalization'
import type { Persona } from '@/types'

import { GROUP_0 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '@tests/helpers/test-utils'

vi.mock('@/hooks/useRealtimeProfile', () => {
  return {
    useRealtimeProfile: () => {
      return { data: undefined }
    },
  }
})

const PERSONA: Persona = {
  type: 'persona',
  id: 'runner',
  label: 'Runner',
  description: 'Likes running gear',
  token: 'persona-runner',
  affinities: { brand: ['Nike'] },
  optionalFilters: ['brand:Nike<score=5>'],
}

const renderParams = (isFeatureEnabled = true) => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        features: {
          agentStudio: {},
          personalization: { enabled: isFeatureEnabled, personas: [PERSONA] },
        },
      }),
    )
  })
  return renderHook(() => usePersonalizationSearchParams(), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })
}

describe('usePersonalizationSearchParams', () => {
  afterEach(() => {
    personalizationStore.set(resetPersonalizationAtom)
  })

  it('sends enablePersonalization false when the feature is on but no persona is active', () => {
    const { result } = renderParams()

    expect(result.current).toEqual({ enablePersonalization: false })
  })

  it('sends nothing when the vertical has personalization disabled', () => {
    const { result } = renderParams(false)

    expect(result.current).toEqual({})
  })

  it('sends the persona token and optionalFilters when a persona is active', () => {
    const { result } = renderParams()

    act(() => {
      personalizationStore.set(setPersonaModeAtom, PERSONA)
    })

    expect(result.current).toEqual({
      userToken: 'persona-runner',
      enablePersonalization: true,
      optionalFilters: PERSONA.optionalFilters,
      getRankingInfo: true,
    })
  })

  it('keeps the same reference across rerenders with no persona', () => {
    const { result, rerender } = renderParams()
    const initial = result.current

    rerender()

    expect(result.current).toBe(initial)
  })

  it('keeps the same reference across rerenders for a customer group', () => {
    personalizationStore.set(setPersonaModeAtom, GROUP_0)
    const { result, rerender } = renderParams()
    const initial = result.current

    rerender()

    expect(result.current).toBe(initial)
  })
})
