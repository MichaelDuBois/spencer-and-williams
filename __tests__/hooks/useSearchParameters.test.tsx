import { renderHook } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PersonalizationMode } from '@/hooks/usePersonalization'
import { useSearchParameters } from '@/hooks/useSearchParameters'
import {
  compositionEnabledAtom,
  demoOptionsStore,
  distinctEnabledAtom,
  dynamicReRankingEnabledAtom,
  neuralSearchEnabledAtom,
} from '@/stores/demoOptions'
import type { VerticalConfig } from '@/types'

import { createMockConfig } from '@tests/helpers/test-utils'

import type { ReactNode } from 'react'

const personalizationMock = vi.fn()
vi.mock('@/hooks/usePersonalization', () => {return {
  usePersonalization: () => personalizationMock(),
}})

const activeConfigMock = vi.fn()
vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => activeConfigMock(),
}})

const ALL_FEATURES: VerticalConfig['features'] = {
  agentStudio: {},
  personalization: { enabled: true },
  dynamicReRanking: { enabled: true },
  neuralSearch: { enabled: true },
  distinct: { enabled: true },
}

interface RenderOptions {
  features?: VerticalConfig['features']
  perso?: {
    currentUserToken?: string
    currentOptionalFilters?: string[]
    mode?: PersonalizationMode
  }
  dynamicReRankingEnabled?: boolean
  neuralSearchEnabled?: boolean
  distinctEnabled?: boolean
  compositionEnabled?: boolean
}

const renderUseSearchParameters = ({
  features = ALL_FEATURES,
  perso = {},
  dynamicReRankingEnabled = true,
  neuralSearchEnabled = true,
  distinctEnabled = true,
  compositionEnabled = true,
}: RenderOptions = {}) => {
  activeConfigMock.mockReturnValue(createMockConfig({ features }))
  personalizationMock.mockReturnValue({
    currentUserToken: '',
    currentOptionalFilters: [],
    mode: 'anonymous',
    ...perso,
  })

  demoOptionsStore.set(dynamicReRankingEnabledAtom, dynamicReRankingEnabled)
  demoOptionsStore.set(neuralSearchEnabledAtom, neuralSearchEnabled)
  demoOptionsStore.set(distinctEnabledAtom, distinctEnabled)
  demoOptionsStore.set(compositionEnabledAtom, compositionEnabled)

  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return renderHook(() => useSearchParameters(), { wrapper })
}

describe('useSearchParameters', () => {
  beforeEach(() => {
    demoOptionsStore.set(dynamicReRankingEnabledAtom, true)
    demoOptionsStore.set(neuralSearchEnabledAtom, true)
    demoOptionsStore.set(distinctEnabledAtom, false)
    demoOptionsStore.set(compositionEnabledAtom, true)
    personalizationMock.mockReset()
    activeConfigMock.mockReset()
  })

  it('always requests click analytics', () => {
    const { result } = renderUseSearchParameters()
    expect(result.current.clickAnalytics).toBe(true)
  })

  it('never includes SRP-only extensions (owned by SearchConfigure)', () => {
    const { result } = renderUseSearchParameters()
    expect(result.current).not.toHaveProperty('extensions')
  })

  describe('anonymous', () => {
    it('sends enablePersonalization: false so Dynamic Re-Ranking is not deactivated', () => {
      const { result } = renderUseSearchParameters({ perso: { mode: 'anonymous' } })
      expect(result.current.enablePersonalization).toBe(false)
    })

    it('omits the userToken and personalization-only params', () => {
      const { result } = renderUseSearchParameters({ perso: { mode: 'anonymous' } })
      expect(result.current).not.toHaveProperty('userToken')
      expect(result.current).not.toHaveProperty('optionalFilters')
      expect(result.current).not.toHaveProperty('getRankingInfo')
    })
  })

  describe('active persona', () => {
    it('enables personalization and forwards the token, optional filters and ranking info', () => {
      const { result } = renderUseSearchParameters({
        perso: {
          mode: 'persona',
          currentUserToken: 'persona-sports-fan',
          currentOptionalFilters: ['brand:Nike<score=5>'],
        },
      })
      expect(result.current.enablePersonalization).toBe(true)
      expect(result.current.userToken).toBe('persona-sports-fan')
      expect(result.current.optionalFilters).toEqual(['brand:Nike<score=5>'])
      expect(result.current.getRankingInfo).toBe(true)
    })
  })

  describe('Dynamic Re-Ranking toggle', () => {
    it('sends enableReRanking: true when the toggle is on', () => {
      const { result } = renderUseSearchParameters({ dynamicReRankingEnabled: true })
      expect(result.current.enableReRanking).toBe(true)
    })

    it('sends enableReRanking: false when the toggle is off', () => {
      const { result } = renderUseSearchParameters({ dynamicReRankingEnabled: false })
      expect(result.current.enableReRanking).toBe(false)
    })

    it('omits enableReRanking when the vertical has no Dynamic Re-Ranking feature', () => {
      const { result } = renderUseSearchParameters({
        features: { agentStudio: {}, personalization: { enabled: true } },
      })
      expect(result.current).not.toHaveProperty('enableReRanking')
    })
  })

  describe('Neural Search toggle', () => {
    it('does not disable neural search when the toggle is on', () => {
      const { result } = renderUseSearchParameters({ neuralSearchEnabled: true })
      expect(result.current.disableNeuralSearch).toBe(false)
    })

    it('disables neural search when the toggle is off', () => {
      const { result } = renderUseSearchParameters({ neuralSearchEnabled: false })
      expect(result.current.disableNeuralSearch).toBe(true)
    })

    it('omits disableNeuralSearch when the vertical has no Neural Search feature', () => {
      const { result } = renderUseSearchParameters({
        features: { agentStudio: {} },
      })
      expect(result.current).not.toHaveProperty('disableNeuralSearch')
    })
  })

  describe('Distinct toggle', () => {
    it('sends distinct: true when the toggle is on', () => {
      const { result } = renderUseSearchParameters({ distinctEnabled: true })
      expect(result.current.distinct).toBe(true)
    })

    it('sends distinct: false when the toggle is off', () => {
      const { result } = renderUseSearchParameters({ distinctEnabled: false })
      expect(result.current.distinct).toBe(false)
    })

    it('omits distinct when the vertical has no Distinct feature', () => {
      const { result } = renderUseSearchParameters({
        features: { agentStudio: {} },
      })
      expect(result.current).not.toHaveProperty('distinct')
    })

    it('omits distinct while the Composition API is active, so it cannot leak to secondary indices', () => {
      const { result } = renderUseSearchParameters({
        features: { ...ALL_FEATURES, composition: { compositionId: 'comp-1' } },
        distinctEnabled: true,
        compositionEnabled: true,
      })
      expect(result.current).not.toHaveProperty('distinct')
    })

    it('restores distinct when the Composition toggle is turned off', () => {
      const { result } = renderUseSearchParameters({
        features: { ...ALL_FEATURES, composition: { compositionId: 'comp-1' } },
        distinctEnabled: true,
        compositionEnabled: false,
      })
      expect(result.current.distinct).toBe(true)
    })

    it('sends distinct when the vertical has no composition configured', () => {
      const { result } = renderUseSearchParameters({
        features: { ...ALL_FEATURES, composition: {} },
        distinctEnabled: true,
        compositionEnabled: true,
      })
      expect(result.current.distinct).toBe(true)
    })
  })

  it('omits enablePersonalization entirely when the vertical has no Personalization feature', () => {
    const { result } = renderUseSearchParameters({
      features: { agentStudio: {}, dynamicReRanking: { enabled: true } },
    })
    expect(result.current).not.toHaveProperty('enablePersonalization')
  })
})
