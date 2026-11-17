import { useAtom } from 'jotai'

import type { DemoOptionToggleProps } from '@/components/options/DemoOptionToggle'
import { useAssistantImplementation } from '@/features/aiAssistant/hooks/ui/useAssistantImplementation'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useIsCompositionActive } from '@/hooks/useIsCompositionActive'
import { track } from '@/lib/analytics/track'
import { DEMO_FEATURES, type DemoFeatureId } from '@/lib/demo-features'
import {
  compositionEnabledAtom,
  demoOptionsStore,
  distinctEnabledAtom,
  dynamicFacetOrderingEnabledAtom,
  dynamicReRankingEnabledAtom,
  filterSuggestionsEnabledAtom,
  inlineArticlesEnabledAtom,
  intentRoutingEnabledAtom,
  neuralSearchEnabledAtom,
  queryCategorizationEnabledAtom,
  type DemoOptionKey,
} from '@/stores/demoOptions'

export interface DemoOption extends DemoOptionToggleProps {
  option: DemoOptionKey
}

export const useDemoOptions = (): DemoOption[] => {
  const config = useActiveConfig()
  const isCompositionActive = useIsCompositionActive()
  const [compositionEnabled, setCompositionEnabled] = useAtom(
    compositionEnabledAtom,
    { store: demoOptionsStore },
  )
  const [filterSuggestionsEnabled, setFilterSuggestionsEnabled] = useAtom(
    filterSuggestionsEnabledAtom,
    { store: demoOptionsStore },
  )
  const [dynamicReRankingEnabled, setDynamicReRankingEnabled] = useAtom(
    dynamicReRankingEnabledAtom,
    { store: demoOptionsStore },
  )
  const [queryCategorizationEnabled, setQueryCategorizationEnabled] = useAtom(
    queryCategorizationEnabledAtom,
    { store: demoOptionsStore },
  )
  const [neuralSearchEnabled, setNeuralSearchEnabled] = useAtom(
    neuralSearchEnabledAtom,
    { store: demoOptionsStore },
  )
  const [dynamicFacetOrderingEnabled, setDynamicFacetOrderingEnabled] = useAtom(
    dynamicFacetOrderingEnabledAtom,
    { store: demoOptionsStore },
  )
  const [intentRoutingEnabled, setIntentRoutingEnabled] = useAtom(
    intentRoutingEnabledAtom,
    { store: demoOptionsStore },
  )
  const [distinctEnabled, setDistinctEnabled] = useAtom(distinctEnabledAtom, {
    store: demoOptionsStore,
  })
  const [inlineArticlesEnabled, setInlineArticlesEnabled] = useAtom(
    inlineArticlesEnabledAtom,
    { store: demoOptionsStore },
  )
  const { isChatWidgetEnabled, setAssistantImplementation } =
    useAssistantImplementation()

  const isFeatureEnabled = (id: DemoFeatureId): boolean =>
    Boolean(config && DEMO_FEATURES[id].isEnabled(config))

  const options: DemoOption[] = []

  if (isFeatureEnabled('neural_search'))
    options.push({
      option: 'neural_search',
      label: DEMO_FEATURES.neural_search.label,
      description: 'Semantic (AI) search vs keyword',
      checked: neuralSearchEnabled,
      onCheckedChange: setNeuralSearchEnabled,
    })

  if (isFeatureEnabled('intent_routing'))
    options.push({
      option: 'intent_routing',
      label: DEMO_FEATURES.intent_routing.label,
      description: 'Route questions to the AI assistant',
      checked: intentRoutingEnabled,
      onCheckedChange: setIntentRoutingEnabled,
    })

  if (isFeatureEnabled('composition'))
    options.push({
      option: 'composition',
      label: DEMO_FEATURES.composition.label,
      description: 'Smart grouping & blending',
      checked: compositionEnabled,
      onCheckedChange: setCompositionEnabled,
    })

  if (isFeatureEnabled('filter_suggestions'))
    options.push({
      option: 'filter_suggestions',
      label: DEMO_FEATURES.filter_suggestions.label,
      description: 'AI-powered filter recommendations',
      checked: filterSuggestionsEnabled,
      onCheckedChange: setFilterSuggestionsEnabled,
    })

  if (isFeatureEnabled('dynamic_re_ranking'))
    options.push({
      option: 'dynamic_re_ranking',
      label: DEMO_FEATURES.dynamic_re_ranking.label,
      description: 'Trending-based result re-ordering',
      checked: dynamicReRankingEnabled,
      onCheckedChange: setDynamicReRankingEnabled,
    })

  if (isFeatureEnabled('query_categorization'))
    options.push({
      option: 'query_categorization',
      label: DEMO_FEATURES.query_categorization.label,
      description: 'Detect query intent & suggest categories',
      checked: queryCategorizationEnabled,
      onCheckedChange: setQueryCategorizationEnabled,
    })

  if (isFeatureEnabled('dynamic_facet_ordering'))
    options.push({
      option: 'dynamic_facet_ordering',
      label: DEMO_FEATURES.dynamic_facet_ordering.label,
      description: 'Re-order facets based on popularity',
      checked: dynamicFacetOrderingEnabled,
      onCheckedChange: setDynamicFacetOrderingEnabled,
    })

  if (isFeatureEnabled('distinct'))
    options.push({
      option: 'distinct',
      label: DEMO_FEATURES.distinct.label,
      description: 'One result per product instead of per variant',
      checked: isCompositionActive ? false : distinctEnabled,
      onCheckedChange: setDistinctEnabled,
      disabled: isCompositionActive,
      disabledTooltip: 'Distinct cannot be enabled with Composition API',
    })

  if (isFeatureEnabled('inline_articles'))
    options.push({
      option: 'inline_articles',
      label: DEMO_FEATURES.inline_articles.label,
      description: 'Blend editorial articles into product results',
      checked: inlineArticlesEnabled,
      onCheckedChange: setInlineArticlesEnabled,
    })

  // Keep last: a test asserts the order of the toggles above it.
  if (isFeatureEnabled('chat_widget'))
    options.push({
      option: 'chat_widget',
      label: DEMO_FEATURES.chat_widget.label,
      description:
        'Use the official Chat widget instead of the custom assistant',
      checked: isChatWidgetEnabled,
      onCheckedChange: setAssistantImplementation,
    })

  return options.map((demoOption) => {
    return {
      ...demoOption,
      onCheckedChange: (enabled) => {
        demoOption.onCheckedChange(enabled)
        track('demo_option_toggled', { option: demoOption.option, enabled })
      },
    }
  })
}
