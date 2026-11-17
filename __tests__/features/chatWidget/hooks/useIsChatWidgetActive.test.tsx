import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useIsChatWidgetActive } from '@/features/chatWidget/hooks/useIsChatWidgetActive'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  chatWidgetEnabledAtom,
  demoOptionsStore,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'
import type { VerticalConfig } from '@/types'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '@tests/helpers/test-utils'

interface RenderOptions {
  config?: VerticalConfig | null
  enabled?: boolean
}

const renderUseIsChatWidgetActive = ({
  config = createMockConfig({
    features: { agentStudio: { chatWidgetAgentID: 'chat-agent-1' } },
  }),
  enabled = true,
}: RenderOptions = {}) => {
  demoOptionsStore.set(chatWidgetEnabledAtom, enabled)
  const store = createTestStore((s) => s.set(activeConfigAtom, config))

  return renderHook(() => useIsChatWidgetActive(), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })
}

describe('useIsChatWidgetActive', () => {
  afterEach(() => {
    demoOptionsStore.set(resetDemoOptionsAtom)
  })

  it('is active when the toggle is on and the config declares an agent', () => {
    const { result } = renderUseIsChatWidgetActive()

    expect(result.current).toBe(true)
  })

  it('is inactive while the toggle is off', () => {
    const { result } = renderUseIsChatWidgetActive({ enabled: false })

    expect(result.current).toBe(false)
  })

  it('is inactive when the agent ID is empty, as on ecommerce staging', () => {
    const { result } = renderUseIsChatWidgetActive({
      config: createMockConfig({
        features: { agentStudio: { chatWidgetAgentID: '' } },
      }),
    })

    expect(result.current).toBe(false)
  })

  it('is inactive when the config declares no chat widget agent', () => {
    const { result } = renderUseIsChatWidgetActive({
      config: createMockConfig(),
    })

    expect(result.current).toBe(false)
  })

  it('is inactive before a config has resolved', () => {
    const { result } = renderUseIsChatWidgetActive({ config: null })

    expect(result.current).toBe(false)
  })
})
