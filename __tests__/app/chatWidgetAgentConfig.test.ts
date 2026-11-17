import { describe, expect, it } from 'vitest'

import { b2bContentConfig } from '@/app/b2b-content/config'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { ecommerceConfig } from '@/app/ecommerce/config'
import { electronicsConfig } from '@/app/electronics/config'
import { fashionConfig } from '@/app/fashion/config'
import { furnishingConfig } from '@/app/furnishing/config'
import { groceryConfig } from '@/app/grocery/config'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { travelConfig } from '@/app/travel/config'
import { getChatSearchIndexNames } from '@/features/chatWidget/utils/buildChatSearchParameters'
import { resolveVerticalConfig } from '@/lib/resolve-vertical-config'
import type { VerticalConfig } from '@/types'

const VERTICAL_CONFIGS: VerticalConfig[] = [
  ecommerceConfig,
  electronicsConfig,
  fashionConfig,
  furnishingConfig,
  groceryConfig,
  b2bWarehouseConfig,
  travelConfig,
  b2bContentConfig,
  mediaEntertainmentConfig,
]

describe.each(VERTICAL_CONFIGS.map((config) => [config.slug, config]))(
  '%s chat widget agent',
  (_slug, config) => {
    it('declares a production chat widget agent', () => {
      expect(config.features.agentStudio.chatWidgetAgentID).toMatch(/\S/)
    })

    it('blanks the agent on staging, since agent IDs are app-scoped', () => {
      expect(config.staging?.agentStudio).toHaveProperty(
        'chatWidgetAgentID',
        '',
      )
      expect(
        resolveVerticalConfig(config, 'staging').features.agentStudio
          .chatWidgetAgentID,
      ).toBe('')
    })
  },
)

// Mirrors demo-scripts data/chatWidgetReplication/verticals.json contentIndices.
const CHAT_SEARCH_INDEX_NAMES: Record<string, string[]> = {
  ecommerce: ['ecommerce_ns_prod'],
  electronics: ['electronics_ns_prod'],
  fashion: ['fashion_ns'],
  furnishing: ['furnishings_ns_prod'],
  grocery: ['grocery_prod_ns'],
  'b2b-warehouse': ['b2b_ns'],
  travel: [
    'travel_media_articles',
    'travel_media_podcasts',
    'travel_media_related_activities',
  ],
  'b2b-content': [
    'documentation_algolia_2025',
    'documentation_zendesk_2025',
    'documentation_blogs_2026',
    'documentation_resource_2026',
  ],
  'media-entertainment': ['media_ns'],
}

describe.each(VERTICAL_CONFIGS.map((config) => [config.slug, config]))(
  '%s chat widget search indices',
  (slug, config) => {
    it.each(['production', 'staging'] as const)(
      'matches the agent search tool on %s',
      (environment) => {
        const resolved = resolveVerticalConfig(config, environment)

        expect(
          getChatSearchIndexNames(
            resolved.algolia.primaryIndex.name,
            resolved.features.agentStudio.chatWidgetIndexNames,
          ),
        ).toEqual(CHAT_SEARCH_INDEX_NAMES[slug])
      },
    )

    it('derives the extra chat indices from its own configured indices', () => {
      const configuredNames = Object.values(config.algolia.indices).map(
        (index) => index?.name,
      )

      for (const name of config.features.agentStudio.chatWidgetIndexNames ??
        []) {
        expect(configuredNames).toContain(name)
      }
    })
  },
)

describe('chat widget agents', () => {
  it('configures comparison for commerce verticals in production only', () => {
    expect(
      ecommerceConfig.features.agentStudio.chatWidgetComparisonConfigurationID,
    ).toBe('algolia_comparison_8bc206ca-d835-4503-b25a-561932e46e2e')
    expect(
      resolveVerticalConfig(ecommerceConfig, 'staging').features.agentStudio
        .chatWidgetComparisonConfigurationID,
    ).toBe('')
    expect(
      fashionConfig.features.agentStudio.chatWidgetComparisonConfigurationID,
    ).toBe('algolia_comparison_2d2fe01d-d37a-4828-8aee-b2de7a545bf9')
    expect(
      resolveVerticalConfig(fashionConfig, 'staging').features.agentStudio
        .chatWidgetComparisonConfigurationID,
    ).toBe('')
    expect(
      electronicsConfig.features.agentStudio.chatWidgetComparisonConfigurationID,
    ).toBe('algolia_comparison_964e858c-68da-4711-8ed9-f92a3c30eadd')
    expect(
      resolveVerticalConfig(electronicsConfig, 'staging').features.agentStudio
        .chatWidgetComparisonConfigurationID,
    ).toBe('')
    for (const [config, id] of [
      [furnishingConfig, 'algolia_comparison_7ef80219-b1f5-4c29-af7f-f85e18564727'],
      [groceryConfig, 'algolia_comparison_d9a9626d-1885-47ff-b1c5-b5f72acce778'],
      [b2bWarehouseConfig, 'algolia_comparison_48133cd6-b4e6-4f9e-a2fc-ac99c54b5242'],
    ] as const) {
      expect(config.features.agentStudio.chatWidgetComparisonConfigurationID).toBe(id)
      expect(resolveVerticalConfig(config, 'staging').features.agentStudio.chatWidgetComparisonConfigurationID).toBe('')
    }
    for (const config of VERTICAL_CONFIGS.filter(
      (item) => !['ecommerce', 'fashion', 'electronics', 'furnishing', 'grocery', 'b2b-warehouse'].includes(item.slug),
    )) {
      expect(
        config.features.agentStudio.chatWidgetComparisonConfigurationID,
      ).toBeUndefined()
    }
  })

  it('configures chat widget prompt suggestions for commerce verticals in production only', () => {
    const PROMPT_SUGGESTIONS_IDS: Record<string, string> = {
      ecommerce: 'algolia_prompt_suggestions_4e1fd1b6-159d-4ec5-bc3e-4fcd90803946',
      electronics: 'algolia_prompt_suggestions_30ffe4ca-5d1e-4951-86dd-b04aab6bcb76',
      fashion: 'algolia_prompt_suggestions_007ab691-bd06-4ea9-9fef-eb1ab4c7bbbd',
      furnishing: 'algolia_prompt_suggestions_00f51d97-122b-42a9-ab79-a505e9454c48',
      grocery: 'algolia_prompt_suggestions_1077271f-92a4-42ef-a1cd-b6b41a1dfedb',
      'b2b-warehouse': 'algolia_prompt_suggestions_e856f4a6-acb8-4ec0-80d7-a24145c052a1',
    }
    for (const [slug, id] of Object.entries(PROMPT_SUGGESTIONS_IDS)) {
      const config = VERTICAL_CONFIGS.find((item) => item.slug === slug)
      expect(config?.features.agentStudio.chatWidgetPromptSuggestionsConfigurationID).toBe(id)
      // Staging inherits the ID; the blank agent ID keeps the widget off there.
      expect(
        resolveVerticalConfig(config!, 'staging').features.agentStudio
          .chatWidgetPromptSuggestionsConfigurationID,
      ).toBe(id)
    }
    for (const config of VERTICAL_CONFIGS.filter(
      (item) => !(item.slug in PROMPT_SUGGESTIONS_IDS),
    )) {
      expect(
        config.features.agentStudio.chatWidgetPromptSuggestionsConfigurationID,
      ).toBeUndefined()
    }
  })

  it('gives every vertical its own agent', () => {
    const agentIDs = VERTICAL_CONFIGS.map(
      (config) => config.features.agentStudio.chatWidgetAgentID,
    )

    expect(new Set(agentIDs).size).toBe(VERTICAL_CONFIGS.length)
  })
})
