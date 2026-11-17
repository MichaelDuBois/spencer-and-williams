import { describe, expect, it } from 'vitest'

import { ecommerceConfig } from '@/app/ecommerce/config'
import type { VerticalConfig } from '@/types'
import { getVerticalDemoFeatures } from '@/verticals/getVerticalDemoFeatures'

const baseConfig: VerticalConfig = {
  ...ecommerceConfig,
  algolia: {
    ...ecommerceConfig.algolia,
    primaryIndex: { name: 'test-index' },
  },
  features: { agentStudio: {} },
}

describe('getVerticalDemoFeatures', () => {
  it('omits optional capabilities when configuration is absent or disabled', () => {
    expect(getVerticalDemoFeatures(baseConfig)).toEqual([])
    expect(
      getVerticalDemoFeatures({
        ...baseConfig,
        features: {
          agentStudio: { shoppingAssistantAgentID: '', chatWidgetAgentID: '' },
          composition: {},
          recommend: { homepage: [], pdp: undefined },
          personalization: { enabled: false },
          neuralSearch: { enabled: false },
          orderHistory: { enabled: false },
        },
      }),
    ).toEqual([])
  })

  it('prioritizes enabled Algolia features and lists the assistant only once', () => {
    const config: VerticalConfig = {
      ...baseConfig,
      features: {
        agentStudio: {
          shoppingAssistantAgentID: 'assistant',
          chatWidgetAgentID: 'chat',
        },
        composition: { multiFeedCompositionId: 'composition' },
        recommend: {
          pdp: [{ model: 'related-products', title: 'Related products' }],
        },
        personalization: { enabled: true },
        neuralSearch: { enabled: true },
        dynamicReRanking: { enabled: true },
        dynamicFacetOrdering: { enabled: true },
        orderHistory: { enabled: true },
        queryCategorization: { enabled: true },
      },
    }

    expect(getVerticalDemoFeatures(config)).toEqual([
      'NeuralSearch',
      'Dynamic Re-Ranking (DRR)',
      'AI Personalization',
      'AI assistant (Agent Studio)',
      'Algolia Recommend',
      'Dynamic Facet Ordering',
      'Merchandised content with Algolia Composition',
      'Query Categorization',
      'Order history',
    ])
  })
})
