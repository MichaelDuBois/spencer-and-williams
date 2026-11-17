import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useIsCompositionActive } from '@/hooks/useIsCompositionActive'
import {
  compositionEnabledAtom,
  demoOptionsStore,
} from '@/stores/demoOptions'
import type { VerticalConfig } from '@/types'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '@tests/helpers/test-utils'

const activeConfigMock = vi.fn()
vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => activeConfigMock(),
}})

interface RenderOptions {
  features?: VerticalConfig['features']
  enabled?: boolean
}

const renderUseIsCompositionActive = ({
  features = { agentStudio: {}, composition: { compositionId: 'comp-1' } },
  enabled = true,
}: RenderOptions = {}) => {
  activeConfigMock.mockReturnValue(createMockConfig({ features }))

  demoOptionsStore.set(compositionEnabledAtom, enabled)

  return renderHook(() => useIsCompositionActive(), {
    wrapper: buildProvidersWrapper({ store: createTestStore() }).Wrapper,
  })
}

describe('useIsCompositionActive', () => {
  beforeEach(() => {
    demoOptionsStore.set(compositionEnabledAtom, true)
  })

  it('is active when the vertical configures a composition and the toggle is on', () => {
    const { result } = renderUseIsCompositionActive()

    expect(result.current).toBe(true)
  })

  it('is inactive while the toggle is off', () => {
    const { result } = renderUseIsCompositionActive({ enabled: false })

    expect(result.current).toBe(false)
  })

  it('is inactive when the vertical configures no composition', () => {
    const { result } = renderUseIsCompositionActive({
      features: { agentStudio: {} },
    })

    expect(result.current).toBe(false)
  })

  it('is inactive when the composition block carries no compositionId', () => {
    const { result } = renderUseIsCompositionActive({
      features: {
        agentStudio: {},
        composition: { multiFeedCompositionId: 'multifeed-1' },
      },
    })

    expect(result.current).toBe(false)
  })

  it('is inactive before a config has resolved', () => {
    activeConfigMock.mockReturnValue(null)

    demoOptionsStore.set(compositionEnabledAtom, true)
    const { result } = renderHook(() => useIsCompositionActive(), {
      wrapper: buildProvidersWrapper({ store: createTestStore() }).Wrapper,
    })

    expect(result.current).toBe(false)
  })
})
