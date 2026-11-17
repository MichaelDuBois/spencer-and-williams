import {
  getPersonalizationSearchParams,
  type PersonalizationSearchParams,
  type PersonalizationState,
} from '@/utilities/personalizationParams'

export interface MediaQuerySpec {
  ruleContexts?: string[]
  filterRuleContexts?: string[]
  filters?: string
  hitsPerPage?: number
}

export interface MediaSearchRequestParams extends PersonalizationSearchParams {
  query: string
  hitsPerPage: number
  attributesToRetrieve: string[]
  attributesToHighlight: string[]
  clickAnalytics: boolean
  filters?: string
}

export interface MediaSearchRequest {
  indexName: string
  params: MediaSearchRequestParams
}

interface BuildRailRequestsArgs {
  specs: readonly MediaQuerySpec[]
  indexName: string
  attributesToRetrieve: string[]
  personalization?: PersonalizationState
}

export const DEFAULT_RAIL_HITS_PER_PAGE = 20

export const buildRailRequests = ({
  specs,
  indexName,
  attributesToRetrieve,
  personalization,
}: BuildRailRequestsArgs): MediaSearchRequest[] =>
  specs.map((spec) => {
    return {
      indexName,
      params: {
        query: '',
        hitsPerPage: spec.hitsPerPage ?? DEFAULT_RAIL_HITS_PER_PAGE,
        attributesToRetrieve,
        // An instruction to suppress highlighting, not a request for it:
        // `_highlightResult` comes back by default for every searchable
        // attribute whether or not there is a query, and was measured as 93% of
        // the homepage payload (792 KB -> 58 KB with it off). Browse renders no
        // highlighting; that is a search-results concern.
        //
        // Only effective on the base client. The Composition API rejects this
        // param at runtime, so the composition client strips it (BLOCKED_PARAMS
        // in create-composition-search-client.ts) and highlighting reverts to
        // the index default — measured at 2.3 MB across the homepage rails with
        // the toggle on, versus 55 KB with it off. Suppressing it on that path
        // has to be configured on the composition's own sources.
        attributesToHighlight: [],
        // Never `analytics: false` — that would orphan the queryIDs the rails
        // stamp onto their items for a later click-events ticket.
        clickAnalytics: true,
        ...(spec.filters ? { filters: spec.filters } : {}),
        // Rule-context and re-ranking semantics — including the
        // drop-pins-when-personalized rule — live in one shared place.
        ...getPersonalizationSearchParams({
          personalization,
          ruleContexts: spec.ruleContexts,
          filterRuleContexts: spec.filterRuleContexts,
        }),
      },
    }
  })
