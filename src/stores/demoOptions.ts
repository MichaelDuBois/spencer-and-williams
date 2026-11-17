import { atom, getDefaultStore } from 'jotai'

// Pinned to jotai's global store so these survive the Algolia environment remount.
export const demoOptionsStore = getDefaultStore()

export const compositionEnabledAtom = atom<boolean>(true)
// Filter Suggestions is hidden across all verticals by default.
// To bring it back, set NEXT_PUBLIC_SHOW_FILTER_SUGGESTIONS=true.
export const isFilterSuggestionsEnabled =
  process.env.NEXT_PUBLIC_SHOW_FILTER_SUGGESTIONS === 'true'
export const filterSuggestionsEnabledAtom = atom<boolean>(
  isFilterSuggestionsEnabled,
)
export const dynamicReRankingEnabledAtom = atom<boolean>(true)
export const queryCategorizationEnabledAtom = atom<boolean>(true)
export const neuralSearchEnabledAtom = atom<boolean>(true)
export const intentRoutingEnabledAtom = atom<boolean>(false)
export const dynamicFacetOrderingEnabledAtom = atom<boolean>(true)
export const distinctEnabledAtom = atom<boolean>(false)
export const inlineArticlesEnabledAtom = atom<boolean>(true)
export const chatWidgetEnabledAtom = atom<boolean>(false)
// Bridges the app's AI entry points to the single mounted Chat widget.
export const chatWidgetPendingMessageAtom = atom<string | null>(null)
// Lets the application reserve layout space only while the official chat is open.
export const chatWidgetOpenAtom = atom<boolean>(false)

export const DEMO_OPTION_ATOMS = {
  neural_search: neuralSearchEnabledAtom,
  intent_routing: intentRoutingEnabledAtom,
  composition: compositionEnabledAtom,
  filter_suggestions: filterSuggestionsEnabledAtom,
  dynamic_re_ranking: dynamicReRankingEnabledAtom,
  query_categorization: queryCategorizationEnabledAtom,
  dynamic_facet_ordering: dynamicFacetOrderingEnabledAtom,
  distinct: distinctEnabledAtom,
  inline_articles: inlineArticlesEnabledAtom,
  chat_widget: chatWidgetEnabledAtom,
}

export type DemoOptionKey = keyof typeof DEMO_OPTION_ATOMS

export const DEMO_OPTION_KEYS = Object.keys(
  DEMO_OPTION_ATOMS,
) as DemoOptionKey[]

export const resetDemoOptionsAtom = atom(null, (_get, set) => {
  set(compositionEnabledAtom, true)
  set(filterSuggestionsEnabledAtom, isFilterSuggestionsEnabled)
  set(dynamicReRankingEnabledAtom, true)
  set(queryCategorizationEnabledAtom, true)
  set(neuralSearchEnabledAtom, true)
  set(intentRoutingEnabledAtom, false)
  set(dynamicFacetOrderingEnabledAtom, true)
  set(distinctEnabledAtom, false)
  set(inlineArticlesEnabledAtom, true)
  set(chatWidgetEnabledAtom, false)
  set(chatWidgetOpenAtom, false)
})
