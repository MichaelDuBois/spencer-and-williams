import {
  B2B_VISIBILITY_ATTRIBUTE,
  CUSTOMER_GROUPS,
} from '@/app/b2b-warehouse/customerGroups'
import { navCategories } from '@/app/b2b-warehouse/navCategories'
import { ORDER_HISTORY_SEEDS } from '@/app/b2b-warehouse/orderHistorySeeds'
import { PERSONAS } from '@/app/b2b-warehouse/personas'
import type { B2BWarehouseConfigType } from '@/app/b2b-warehouse/types'
import type { FacetConfig } from '@/types'

export const B2B_VISIBILITY_FACET = {
  attribute: B2B_VISIBILITY_ATTRIBUTE,
  label: 'Visible by',
  type: 'refinement',
  valueLabels: Object.fromEntries(
    CUSTOMER_GROUPS.map(({ groupId, label }) => [groupId, label]),
  ),
  includeInAgentContext: false,
} satisfies FacetConfig

const HIERARCHICAL_CATEGORY_LEVELS = [
  'hierarchicalCategories.level0',
  'hierarchicalCategories.level1',
  'hierarchicalCategories.level2',
  'hierarchicalCategories.level3',
] as const

export const b2bWarehouseConfig: B2BWarehouseConfigType = {
  slug: 'b2b-warehouse',
  name: 'B2B Warehouse',
  description:
    'A bulk industrial supply storefront — tools, safety gear, fasteners, and MRO essentials for warehouses and jobsites.',
  assets: {
    favicon: '/images/b2b-warehouse/b2b-warehouse-favicon.svg',
    logo: '/images/b2b-warehouse/b2b-warehouse-logo.svg',
    banner: '/images/b2b-warehouse/b2b-warehouse-banner.webp',
  },
  theme: 'b2b-warehouse',
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'b2b_ns',
      replicas: [
        { label: 'Price: Low to High', indexName: 'b2b_ns_price_asc' },
        { label: 'Price: High to Low', indexName: 'b2b_ns_price_desc' },
      ],
      template: {
        attributes: {
          name: 'name',
          sku: 'sku',
          image: 'image',
          price: 'price',
          brand: 'brand',
          description: 'description',
          category: 'category',
          hierarchicalCategories: HIERARCHICAL_CATEGORY_LEVELS,
          info: 'info',
          rating: 'reviews.rating',
          reviewsCount: 'reviews.count',
          availableInStores: 'availableInStores',
        },
        imageHrefPrefix: '',
      },
      facets: [
        {
          attribute: HIERARCHICAL_CATEGORY_LEVELS,
          label: 'Category',
          type: 'hierarchical',
        },
        { attribute: 'brand', label: 'Brand', type: 'refinement' },
        B2B_VISIBILITY_FACET,
        {
          attribute: 'price',
          label: 'Price',
          type: 'slider',
          prefix: '$',
          defaultOpen: true,
        },
        { attribute: 'type_select', label: 'Type', type: 'refinement' },
        { attribute: 'material_select', label: 'Material', type: 'refinement' },
        {
          attribute: 'units.unitNames',
          label: 'Unit of Measure',
          type: 'refinement',
        },
      ],
    },
    indices: {
      querySuggestions: {
        name: 'b2b_ns_query_suggestions',
        facets: [],
      },
      locations: {
        name: 'generic_locations',
      },
      aiSuggestions: {
        name: 'b2b_ai_suggestions',
        facets: [],
      },
    },
  },
  locator: {
    nounSingular: 'warehouse',
    nounPlural: 'warehouses',
  },
  features: {
    agentStudio: {
      filterSuggestionsAgentID: '28a3b041-70ea-4837-9e78-d51a0fae0607',
      shoppingAssistantAgentID: '2aea6c27-1121-4932-a93f-33fc2857a73d',
      chatWidgetAgentID: 'e6e42a67-65bb-4a45-85eb-29550366be70',
      chatWidgetComparisonConfigurationID:
        'algolia_comparison_48133cd6-b4e6-4f9e-a2fc-ac99c54b5242',
      chatWidgetPromptSuggestionsConfigurationID:
        'algolia_prompt_suggestions_e856f4a6-acb8-4ec0-80d7-a24145c052a1',
      questionSuggestionsAgentID: '13a8ed2c-f4bf-4c13-acd0-681fd07ead9a',
      searchFilters: true,
    },
    composition: {
      compositionId: 'comp1783604578334___b2b_ns',
    },
    recommend: {
      noResults: [
        {
          model: 'trending-items',
          title: 'Trending in Your Warehouse',
        },
      ],
      homepage: [
        { model: 'trending-items', title: 'Trending in Your Warehouse' },
      ],
      pdp: [
        { model: 'bought-together', title: 'Frequently Bought Together' },
        { model: 'related-products', title: 'Related Products' },
      ],
      cart: [{ model: 'bought-together', title: 'Frequently Bought Together' }],
    },
    personalization: {
      enabled: true,
      personas: [...PERSONAS, ...CUSTOMER_GROUPS],
    },
    orderHistory: {
      enabled: true,
      seeds: ORDER_HISTORY_SEEDS,
    },
    dynamicReRanking: { enabled: true },
    queryCategorization: { enabled: true },
    neuralSearch: { enabled: true },
    intentRouting: { enabled: true },
    dynamicFacetOrdering: { enabled: true },
  },
  staging: {
    appId: 'TMALC8UD1C',
    apiKey: 'ae488ca7686a43117b40cd6da128f03c',
    agentStudio: {
      filterSuggestionsAgentID: '7dd45d56-e8ac-4415-85dc-4ed5d8692b1d',
      shoppingAssistantAgentID: 'e4f3bf57-eea7-49ac-b35a-48a193031e45',
      // Chat agents are app-scoped; add the staging agent ID here when available.
      chatWidgetAgentID: '',
      chatWidgetComparisonConfigurationID: '',
      questionSuggestionsAgentID: 'd8f51d19-3aab-4474-a60f-c266128565b3',
    },
  },
  merchandising: {
    categoryAttribute: 'categoryPageId',
    nestedSeparator: ' > ',
  },
  navigation: navCategories,
  homepageCarousels: [
    {
      title: 'Featured Supplies',
      ruleContexts: ['homepage-featured-b2b-warehouse'],
    },
  ],
  carouselCategories: [
    {
      category: 'Cutting Tools & Metalworking',
      label: 'Cutting Tools & Metalworking',
    },
    { category: 'Safety & Security', label: 'Safety & Security' },
    { category: 'Hand Tools', label: 'Hand Tools' },
    { category: 'Power Tools', label: 'Power Tools' },
    { category: 'Abrasives', label: 'Abrasives' },
    { category: 'Fasteners & Hardware', label: 'Fasteners & Hardware' },
    {
      category: 'Material Handling, Hydraulics & Storage',
      label: 'Material Handling',
    },
    {
      category: 'Construction Supply / Jobsite Ops',
      label: 'Construction Supply',
    },
  ],
  collections: [
    {
      collection: 'Best Sellers',
      label: 'Best Sellers',
      description:
        'Our highest-volume, most-reordered supplies — trusted by warehouses and jobsites nationwide.',
    },
    {
      collection: 'Titanium Drill Bits',
      label: 'Titanium Drill Bits',
      description:
        'Precision titanium-coated bits engineered for speed and long life in metal, wood, and composites.',
    },
  ],
}
