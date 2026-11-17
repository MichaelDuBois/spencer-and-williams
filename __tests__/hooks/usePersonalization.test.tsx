import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PERSONAS } from '@/app/b2b-warehouse/personas'
import { usePersonalization } from '@/hooks/usePersonalization'
import { useSearchParameters } from '@/hooks/useSearchParameters'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
  setPersonaModeAtom,
  setRealtimeModeAtom,
} from '@/stores/personalization'

import { GROUP_0 } from '@tests/helpers/customerGroups'
import {
  buildJotaiWrapper,
  createTestStore,
} from '@tests/helpers/jotai-wrapper'
import { createMockConfig } from '@tests/helpers/test-utils'

const { realtimeProfile } = vi.hoisted(() => {return {
  realtimeProfile: vi.fn(() => {return { data: ['brand:Realtime'] }}),
}})
vi.mock('@/hooks/useRealtimeProfile', () => {return {
  useRealtimeProfile: realtimeProfile,
}})

describe('profile modes', () => {
  it('keeps group analytics identity without enabling affinity personalization', () => {
    const store = createTestStore((s) => {
      s.set(
        activeConfigAtom,
        createMockConfig({
          features: { agentStudio: {}, personalization: { enabled: true } },
        }),
      )
    })
    personalizationStore.set(setPersonaModeAtom, GROUP_0)
    const { result } = renderHook(
      () => {return { profile: usePersonalization(), params: useSearchParameters() }},
      { wrapper: buildJotaiWrapper(store) },
    )
    expect(result.current.profile).toEqual({
      mode: 'customerGroup',
      currentUserToken: GROUP_0.token,
      currentOptionalFilters: [],
    })
    expect(result.current.params).toEqual({
      clickAnalytics: true,
      userToken: GROUP_0.token,
      enablePersonalization: false,
    })
    expect(realtimeProfile).toHaveBeenLastCalledWith('')

    act(() => personalizationStore.set(setPersonaModeAtom, PERSONAS[0]))
    expect(result.current.profile).toEqual({
      mode: 'persona',
      currentUserToken: PERSONAS[0].token,
      currentOptionalFilters: PERSONAS[0].optionalFilters,
    })
    expect(result.current.params.enablePersonalization).toBe(true)
    expect(result.current.params.optionalFilters).toEqual(
      PERSONAS[0].optionalFilters,
    )

    act(() => personalizationStore.set(setRealtimeModeAtom))
    expect(result.current.profile).toEqual({
      mode: 'realtime',
      currentUserToken: personalizationStore.get(realtimeSessionTokenAtom),
      currentOptionalFilters: ['brand:Realtime'],
    })
    expect(result.current.params.enablePersonalization).toBe(true)

    act(() => personalizationStore.set(setPersonaModeAtom, null))
    expect(result.current.profile).toEqual({
      mode: 'anonymous',
      currentUserToken: '',
      currentOptionalFilters: [],
    })
    expect(result.current.params.enablePersonalization).toBe(false)
  })
})
