import { describe, expect, it } from 'vitest'

import {
  hasStagingConfig,
  resolveVerticalConfig,
} from '@/lib/resolve-vertical-config'
import type { VerticalStagingOverrides } from '@/types'

import { createMockConfig } from '@tests/helpers/test-utils'


const STAGING: VerticalStagingOverrides = {
  appId: 'STAGING_APP',
  apiKey: 'staging-key',
}

describe('hasStagingConfig', () => {
  it('is true for a vertical with a staging block', () => {
    expect(hasStagingConfig(createMockConfig({ staging: STAGING }))).toBe(true)
  })

  it('is false for a vertical without one', () => {
    expect(hasStagingConfig(createMockConfig())).toBe(false)
  })

  it('is false for a staging block with blank credentials', () => {
    expect(
      hasStagingConfig(
        createMockConfig({ staging: { appId: '', apiKey: '' } }),
      ),
    ).toBe(false)
  })
})

describe('resolveVerticalConfig', () => {
  it('returns the same reference in production', () => {
    const config = createMockConfig({ staging: STAGING })

    expect(resolveVerticalConfig(config, 'production')).toBe(config)
  })

  it('returns the same reference on staging when the vertical has no staging app', () => {
    const config = createMockConfig()

    expect(resolveVerticalConfig(config, 'staging')).toBe(config)
  })

  it('returns the same reference on staging when the credentials are blank', () => {
    const config = createMockConfig({ staging: { appId: '', apiKey: '' } })

    expect(resolveVerticalConfig(config, 'staging')).toBe(config)
  })

  it('swaps in the credentials declared by the vertical', () => {
    const config = createMockConfig({ staging: STAGING })

    const resolved = resolveVerticalConfig(config, 'staging')

    expect(resolved.algolia.appId).toBe('STAGING_APP')
    expect(resolved.algolia.apiKey).toBe('staging-key')
  })

  it('preserves the index configuration identity', () => {
    const config = createMockConfig({ staging: STAGING })

    const resolved = resolveVerticalConfig(config, 'staging')

    expect(resolved.algolia.primaryIndex).toBe(config.algolia.primaryIndex)
    expect(resolved.algolia.indices).toBe(config.algolia.indices)
  })

  it('inherits production composition and agent ids when nothing is overridden', () => {
    const config = createMockConfig({
      features: {
        agentStudio: {
          filterSuggestionsAgentID: 'prod-filters',
          shoppingAssistantAgentID: 'prod-assistant',
          searchFilters: true,
        },
        composition: {
          compositionId: 'prod-composition',
          multiFeedCompositionId: 'prod-multifeed',
        },
      },
      staging: STAGING,
    })

    const resolved = resolveVerticalConfig(config, 'staging')

    expect(resolved.features.agentStudio).toEqual({
      filterSuggestionsAgentID: 'prod-filters',
      shoppingAssistantAgentID: 'prod-assistant',
      searchFilters: true,
    })
    expect(resolved.features.composition).toEqual({
      compositionId: 'prod-composition',
      multiFeedCompositionId: 'prod-multifeed',
    })
  })

  it('omits the composition key entirely when neither side declares it', () => {
    const config = createMockConfig({ staging: STAGING })

    const resolved = resolveVerticalConfig(config, 'staging')

    expect(resolved.features.composition).toBeUndefined()
    expect('composition' in resolved.features).toBe(false)
  })

  it('adds composition when only staging declares it', () => {
    const config = createMockConfig({
      staging: {
        ...STAGING,
        composition: { compositionId: 'staging-composition' },
      },
    })

    const resolved = resolveVerticalConfig(config, 'staging')

    expect(resolved.features.composition).toEqual({
      compositionId: 'staging-composition',
    })
  })

  it('replaces only the declared ids and keeps searchFilters', () => {
    const config = createMockConfig({
      features: {
        agentStudio: {
          filterSuggestionsAgentID: 'prod-filters',
          shoppingAssistantAgentID: 'prod-assistant',
          searchFilters: true,
        },
        composition: {
          compositionId: 'prod-composition',
          multiFeedCompositionId: 'prod-multifeed',
        },
      },
      staging: {
        ...STAGING,
        agentStudio: { shoppingAssistantAgentID: 'staging-assistant' },
        composition: { compositionId: 'staging-composition' },
      },
    })

    const resolved = resolveVerticalConfig(config, 'staging')

    expect(resolved.features.agentStudio).toEqual({
      filterSuggestionsAgentID: 'prod-filters',
      shoppingAssistantAgentID: 'staging-assistant',
      searchFilters: true,
    })
    expect(resolved.features.composition).toEqual({
      compositionId: 'staging-composition',
      multiFeedCompositionId: 'prod-multifeed',
    })
  })

  it('allows staging to leave an app-scoped agent id empty', () => {
    const config = createMockConfig({
      features: { agentStudio: { chatWidgetAgentID: 'production-chat' } },
      staging: {
        ...STAGING,
        agentStudio: { chatWidgetAgentID: '' },
      },
    })

    const resolved = resolveVerticalConfig(config, 'staging')

    expect(resolved.features.agentStudio.chatWidgetAgentID).toBe('')
  })

  it('leaves the production config untouched', () => {
    const config = createMockConfig({
      features: { agentStudio: { filterSuggestionsAgentID: 'prod-filters' } },
      staging: {
        ...STAGING,
        agentStudio: { filterSuggestionsAgentID: 'staging-filters' },
      },
    })

    resolveVerticalConfig(config, 'staging')

    expect(config.algolia.appId).toBe('APP_ID')
    expect(config.features.agentStudio.filterSuggestionsAgentID).toBe(
      'prod-filters',
    )
  })
})
