import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useComparisonCapability } from '@/features/chatWidget/hooks/useComparisonCapability'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  chatWidgetEnabledAtom,
  demoOptionsStore,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'
import type { VerticalConfig } from '@/types'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
} from '@tests/helpers/test-utils'

const renderCapability = (config: VerticalConfig | null, enabled = true) => {
  demoOptionsStore.set(chatWidgetEnabledAtom, enabled)
  const store = createTestStore((s) => s.set(activeConfigAtom, config))
  return renderHook(useComparisonCapability, {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })
}

const configWithIds = (agentId: string, comparisonId?: string) =>
  createMockConfig({
    features: {
      agentStudio: {
        chatWidgetAgentID: agentId,
        chatWidgetComparisonConfigurationID: comparisonId,
      },
    },
  })

describe('useComparisonCapability', () => {
  afterEach(() => demoOptionsStore.set(resetDemoOptionsAtom))

  it('returns the configured ID and comparison limits for an active chat', () => {
    const { result } = renderCapability(configWithIds('agent', 'comparison'))
    expect(result.current).toEqual({
      configurationId: 'comparison',
      minItems: 2,
      maxItems: 3,
    })
  })

  it('hides comparison when chat is disabled', () => {
    expect(
      renderCapability(configWithIds('agent', 'comparison'), false).result
        .current,
    ).toBeNull()
  })

  it('hides comparison without an agent or resolved config', () => {
    expect(
      renderCapability(configWithIds('', 'comparison')).result.current,
    ).toBeNull()
    expect(renderCapability(null).result.current).toBeNull()
  })

  it.each([undefined, '', '   '])(
    'hides comparison for a missing ID: %s',
    (id) => {
      expect(
        renderCapability(configWithIds('agent', id)).result.current,
      ).toBeNull()
    },
  )
})
