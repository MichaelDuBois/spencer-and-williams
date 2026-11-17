import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PERSONAS } from '@/app/b2b-warehouse/personas'
import { useAffinities } from '@/hooks/useAffinities'

import { GROUP_0 } from '@tests/helpers/customerGroups'

const { profile, realtime } = vi.hoisted(() => {return {
  profile: vi.fn(() => {return { data: { brand: { DEWALT: 10 } }, isLoading: false }}),
  realtime: vi.fn(() => {return {
    data: ['brand:DEWALT<score=20>'],
    isLoading: false,
  }}),
}})
vi.mock('@/hooks/usePersonalizationProfile', () => {return {
  usePersonalizationProfile: profile,
}})
vi.mock('@/hooks/useRealtimeProfile', () => {return { useRealtimeProfile: realtime }})

describe('useAffinities', () => {
  it.each([GROUP_0.token, 'realtime-group-token'])(
    'disables both profile requests for group token %s and ignores cached affinities',
    (token) => {
      const { result } = renderHook(() =>
        useAffinities(token, { ...GROUP_0, token }),
      )
      expect(profile).toHaveBeenLastCalledWith('')
      expect(realtime).toHaveBeenLastCalledWith('')
      expect(result.current).toEqual({ affinities: null, isLoading: false })
    },
  )

  it('keeps ordinary persona API affinities', () => {
    const { result } = renderHook(() =>
      useAffinities(PERSONAS[0].token, PERSONAS[0]),
    )
    expect(profile).toHaveBeenLastCalledWith(PERSONAS[0].token)
    expect(result.current.affinities).toEqual({ brand: { DEWALT: 10 } })
  })

  it('keeps realtime affinities', () => {
    const { result } = renderHook(() =>
      useAffinities('realtime-test', undefined),
    )
    expect(realtime).toHaveBeenLastCalledWith('realtime-test')
    expect(result.current.affinities).toEqual({ brand: { DEWALT: 20 } })
  })
})
