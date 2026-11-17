import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useIsChatWidgetSuggestionsActive } from '@/features/chatWidget/hooks/useIsChatWidgetSuggestionsActive'
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

const renderUseIsChatWidgetSuggestionsActive = ({
  config = createMockConfig({
    features: {
      agentStudio: {
        chatWidgetAgentID: 'chat-agent-1',
        chatWidgetPromptSuggestionsConfigurationID:
          'algolia_prompt_suggestions_1',
      },
    },
  }),
  enabled = true,
}: RenderOptions = {}) => {
  demoOptionsStore.set(chatWidgetEnabledAtom, enabled)
  const store = createTestStore((s) => s.set(activeConfigAtom, config))

  return renderHook(() => useIsChatWidgetSuggestionsActive(), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })
}

describe('useIsChatWidgetSuggestionsActive', () => {
  afterEach(() => {
    demoOptionsStore.set(resetDemoOptionsAtom)
  })

  it('is active when the toggle is on and both IDs are configured', () => {
    const { result } = renderUseIsChatWidgetSuggestionsActive()

    expect(result.current).toBe(true)
  })

  it('is inactive while the chat widget toggle is off', () => {
    const { result } = renderUseIsChatWidgetSuggestionsActive({ enabled: false })

    expect(result.current).toBe(false)
  })

  it('is inactive when the prompt suggestions configuration is missing', () => {
    const { result } = renderUseIsChatWidgetSuggestionsActive({
      config: createMockConfig({
        features: { agentStudio: { chatWidgetAgentID: 'chat-agent-1' } },
      }),
    })

    expect(result.current).toBe(false)
  })

  it('is inactive when the prompt suggestions configuration is blank', () => {
    const { result } = renderUseIsChatWidgetSuggestionsActive({
      config: createMockConfig({
        features: {
          agentStudio: {
            chatWidgetAgentID: 'chat-agent-1',
            chatWidgetPromptSuggestionsConfigurationID: '  ',
          },
        },
      }),
    })

    expect(result.current).toBe(false)
  })

  it('is inactive when the chat widget agent is missing, as on staging', () => {
    const { result } = renderUseIsChatWidgetSuggestionsActive({
      config: createMockConfig({
        features: {
          agentStudio: {
            chatWidgetPromptSuggestionsConfigurationID:
              'algolia_prompt_suggestions_1',
          },
        },
      }),
    })

    expect(result.current).toBe(false)
  })

  it('is inactive before a config has resolved', () => {
    const { result } = renderUseIsChatWidgetSuggestionsActive({ config: null })

    expect(result.current).toBe(false)
  })
})
