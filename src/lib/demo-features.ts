import { isFilterSuggestionsEnabled } from '@/stores/demoOptions'
import type { VerticalConfig } from '@/types'

interface DemoFeature {
  label: string
  isEnabled: (config: VerticalConfig) => boolean
}

export const DEMO_FEATURES = {
  neural_search: {
    label: 'NeuralSearch',
    isEnabled: ({ features }) => Boolean(features.neuralSearch?.enabled),
  },
  dynamic_re_ranking: {
    label: 'Dynamic Re-Ranking (DRR)',
    isEnabled: ({ features }) => Boolean(features.dynamicReRanking?.enabled),
  },
  personalization: {
    label: 'AI Personalization',
    isEnabled: ({ features }) => Boolean(features.personalization?.enabled),
  },
  assistant: {
    label: 'AI assistant (Agent Studio)',
    isEnabled: ({ features }) =>
      Boolean(
        features.agentStudio.shoppingAssistantAgentID ||
        features.agentStudio.chatWidgetAgentID,
      ),
  },
  recommend: {
    label: 'Algolia Recommend',
    isEnabled: ({ features }) =>
      Object.values(features.recommend ?? {}).some(
        (sections) => (sections?.length ?? 0) > 0,
      ),
  },
  dynamic_facet_ordering: {
    label: 'Dynamic Facet Ordering',
    isEnabled: ({ features }) =>
      Boolean(features.dynamicFacetOrdering?.enabled),
  },
  composition: {
    label: 'Merchandised content with Algolia Composition',
    isEnabled: ({ features }) =>
      Boolean(
        features.composition?.compositionId ||
        features.composition?.multiFeedCompositionId,
      ),
  },
  query_categorization: {
    label: 'Query Categorization',
    isEnabled: ({ features }) => Boolean(features.queryCategorization?.enabled),
  },
  summary: {
    label: 'AI Summary',
    isEnabled: ({ features }) => Boolean(features.agentStudio.summaryAgentID),
  },
  filter_suggestions: {
    label: 'Filter Suggestions',
    isEnabled: ({ features }) =>
      isFilterSuggestionsEnabled &&
      Boolean(features.agentStudio.filterSuggestionsAgentID),
  },
  question_suggestions: {
    label: 'Question Suggestions',
    isEnabled: ({ features }) =>
      Boolean(features.agentStudio.questionSuggestionsAgentID),
  },
  distinct: {
    label: 'Distinct',
    isEnabled: ({ features }) => Boolean(features.distinct?.enabled),
  },
  intent_routing: {
    label: 'Conversational Search',
    isEnabled: ({ features }) => Boolean(features.intentRouting?.enabled),
  },
  order_history: {
    label: 'Order history',
    isEnabled: ({ features }) => Boolean(features.orderHistory?.enabled),
  },
  inline_articles: {
    label: 'Inline Articles',
    isEnabled: (config) =>
      config.slug === 'fashion' &&
      'showInlineArticles' in config.features &&
      config.features.showInlineArticles === true,
  },
  chat_widget: {
    label: 'InstantSearch Chat Widget',
    isEnabled: ({ features }) =>
      Boolean(features.agentStudio.chatWidgetAgentID),
  },
} satisfies Record<string, DemoFeature>

export type DemoFeatureId = keyof typeof DEMO_FEATURES

export const LANDING_FEATURE_IDS: readonly DemoFeatureId[] = [
  'neural_search',
  'dynamic_re_ranking',
  'personalization',
  'assistant',
  'recommend',
  'dynamic_facet_ordering',
  'composition',
  'query_categorization',
  'summary',
  'filter_suggestions',
  'question_suggestions',
  'distinct',
  'intent_routing',
  'order_history',
]
