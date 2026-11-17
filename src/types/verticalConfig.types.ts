import type { ProductRecommendModel } from '@/hooks/useRecommend'
import type { OrderHistorySeeds } from '@/stores/orderHistory'

export type FacetType =
  | 'refinement'
  | 'slider'
  | 'hierarchical'
  | 'color'
  | 'size'

export interface Persona {
  type?: 'persona'
  id: string
  label: string
  description: string
  token: string
  affinities: Record<string, string[]>
  optionalFilters: string[]
  /** Assistant starter chips for this profile, used by `personaStarters: 'curated'` verticals. */
  assistantPrompts?: string[]
}

export interface CustomerGroupProfile extends Pick<
  Persona,
  'id' | 'label' | 'description' | 'token'
> {
  type: 'customerGroup'
  groupId: string
  discount: number
}

export type SelectableProfile = Persona | CustomerGroupProfile

export interface FacetConfig {
  attribute: string | readonly string[]
  label: string
  type: FacetType
  valueLabels?: Record<string, string>
  includeInAgentContext?: boolean
  prefix?: string
  defaultOpen?: boolean
}

export interface NavigationItem {
  label: string
  category: string
  /** Illustration shown in the desktop mega-menu panel (flat categories only). */
  illustrationImage?: string
  children?: NavigationItem[]
}

export interface RecommendSection {
  model: ProductRecommendModel
  title: string
}

export interface EmptyQueryRowConfig {
  title: string
  ruleContexts?: string[]
  indexName?: string
}

/** One homepage carousel. Its rule contexts *are* the selection, so they are required. */
export interface HomepageCarouselConfig extends EmptyQueryRowConfig {
  ruleContexts: string[]
}

export interface IndexReplica {
  /** Also the key in a composition's `sortingStrategy` map. */
  label: string
  indexName: string
}

export interface IndexConfig<Template = unknown> {
  name: string
  replicas?: IndexReplica[]
  template?: Template
  facets?: FacetConfig[]
}

export type IndexTemplateMap = Record<string, unknown>

export interface AlgoliaAppCredentials {
  appId: string
  apiKey: string
}

export interface AlgoliaConfig<
  PrimaryTemplate = unknown,
  IndicesTemplates extends IndexTemplateMap = IndexTemplateMap,
> extends AlgoliaAppCredentials {
  /** Dedicated search routes mapped to keys in indices. */
  searchRouteIndices?: Partial<Record<string, keyof IndicesTemplates>>
  primaryIndex: IndexConfig<PrimaryTemplate>
  indices: {
    [K in keyof IndicesTemplates]: IndexConfig<IndicesTemplates[K]>
  }
}

/** App-scoped agent ids: valid only against the app that owns them. */
export interface AgentStudioAgentIds {
  filterSuggestionsAgentID?: string
  shoppingAssistantAgentID?: string
  chatWidgetAgentID?: string
  chatWidgetComparisonConfigurationID?: string
  /** Prompt Suggestions configuration invoked through the chat widget agent (`algolia_prompt_suggestions_<uuid>`). */
  chatWidgetPromptSuggestionsConfigurationID?: string
  questionSuggestionsAgentID?: string
  summaryAgentID?: string
}

export interface AgentStudioConfig extends AgentStudioAgentIds {
  searchFilters?: boolean
  /** Extra indices the chat widget agent searches; update when an index is added to or removed from that agent. */
  chatWidgetIndexNames?: string[]
}

export interface CompositionConfig {
  compositionId?: string
  multiFeedCompositionId?: string
}

/** The staging app for this vertical, plus the app-scoped IDs that differ there. */
export interface VerticalStagingOverrides extends AlgoliaAppCredentials {
  composition?: CompositionConfig
  agentStudio?: AgentStudioAgentIds
}

export interface VerticalConfig<
  PrimaryTemplate = unknown,
  IndicesTemplates extends IndexTemplateMap = IndexTemplateMap,
> {
  slug: string
  name: string
  description: string
  assets: {
    favicon: string
    logo: string
    banner: string
  }
  theme: string
  /** Marks the theme as dark, so shared UI can surface a dark-mode affordance. */
  darkMode?: boolean
  algolia: AlgoliaConfig<PrimaryTemplate, IndicesTemplates>
  /** Overrides applied when the demo is pointed at the staging Algolia app. */
  staging?: VerticalStagingOverrides
  features: {
    agentStudio: AgentStudioConfig
    composition?: CompositionConfig
    recommend?: {
      homepage?: RecommendSection[]
      pdp?: RecommendSection[]
      cart?: RecommendSection[]
      noResults?: RecommendSection[]
    }
    personalization?: {
      enabled: boolean
      personas?: SelectableProfile[]
    }
    orderHistory?: {
      enabled: boolean
      seeds?: OrderHistorySeeds
    }
    dynamicReRanking?: {
      enabled: boolean
    }
    queryCategorization?: {
      enabled: boolean
    }
    neuralSearch?: {
      enabled: boolean
    }
    intentRouting?: {
      enabled: boolean
    }
    dynamicFacetOrdering?: {
      enabled: boolean
    }
    distinct?: {
      enabled: boolean
    }
  }
  merchandising?: {
    categoryAttribute: string
    nestedSeparator: string
  }
  locator?: {
    nounSingular: string
    nounPlural: string
  }
  navigation?: NavigationItem[]
  homepageCarousels?: HomepageCarouselConfig[]
  carouselCategories?: {
    category: string
    label: string
  }[]
  collections?: {
    collection: string
    label: string
    description?: string
  }[]
}

export type CreateConfigType<
  PrimaryTemplate,
  IndicesTemplates extends IndexTemplateMap = Record<string, never>,
> = VerticalConfig<PrimaryTemplate, IndicesTemplates>

export interface Vertical {
  config: VerticalConfig
}
