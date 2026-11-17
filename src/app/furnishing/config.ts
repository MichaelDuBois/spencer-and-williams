import { navCategories } from '@/app/furnishing/navCategories'
import { ORDER_HISTORY_SEEDS } from '@/app/furnishing/orderHistorySeeds'
import { PERSONAS } from '@/app/furnishing/personas'
import type { FurnishingConfigType } from '@/app/furnishing/types'

const HIERARCHICAL_CATEGORY_LEVELS = [
  'hierarchicalCategories.level0',
  'hierarchicalCategories.level1',
  'hierarchicalCategories.level2',
  'hierarchicalCategories.level3',
] as const

export const furnishingConfig: FurnishingConfigType = {
  slug: 'furnishing',
  name: 'Furnishing',
  description: 'Furniture and home décor designed for everyday living.',
  assets: {
    favicon: '/images/furnishing/furnishing-favicon.svg',
    logo: '/images/furnishing/furnishing-logo.svg',
    banner: '/images/furnishing/furnishing-banner.webp',
  },
  theme: 'furnishing',
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'furnishings_ns_prod',
      replicas: [
        {
          label: 'Price: Low to High',
          indexName: 'furnishings_ns_prod_price_asc',
        },
        {
          label: 'Price: High to Low',
          indexName: 'furnishings_ns_prod_price_desc',
        },
        { label: 'Top Rated', indexName: 'furnishings_ns_prod_rating_desc' },
      ],
      template: {
        attributes: {
          name: 'name',
          image: 'image',
          price: 'price',
          brand: 'brand',
          description: 'description',
          category: 'category',
          hierarchicalCategories: HIERARCHICAL_CATEGORY_LEVELS,
          rating: 'rating',
          ratingsCount: 'ratingsCount',
          popularity: 'popularity',
          sales: 'sales',
          dimensions: 'info.Product Dimensions',
          material: 'info.Material',
          frameMaterial: 'info.Frame Material',
          upholsteryFabric: 'attrs.Upholstery Fabric Type',
          roomType: 'attrs.Room Type',
          assemblyRequired: 'info.Assembly Required',
          color: 'attrs.Color',
          style: 'attrs.Style',
          productType: 'attrs.Type',
          availableInStores: 'availableInStores',
        },
        imageHrefPrefix:
          'https://fxqklbpngldowtbkqezm.supabase.co/storage/v1/object/public/product-images/',
      },
      facets: [
        {
          attribute: HIERARCHICAL_CATEGORY_LEVELS,
          label: 'Category',
          type: 'hierarchical',
        },
        { attribute: 'brand', label: 'Brand', type: 'refinement' },
        {
          attribute: 'price',
          label: 'Price',
          type: 'slider',
          prefix: '$',
          defaultOpen: true,
        },
        {
          attribute: 'attrs.Room Type',
          label: 'Room Type',
          type: 'refinement',
        },
        { attribute: 'attrs.Style', label: 'Style', type: 'refinement' },
        { attribute: 'attrs.Type', label: 'Type', type: 'refinement' },
        { attribute: 'attrs.Color', label: 'Color', type: 'color' },
        {
          attribute: 'attrs.Upholstery Fabric Type',
          label: 'Upholstery Fabric',
          type: 'refinement',
        },
      ],
    },
    indices: {
      querySuggestions: {
        name: 'furnishings_ns_prod_query_suggestions',
        facets: [],
      },
      aiSuggestions: {
        name: 'furnishings_ai_suggestions',
        facets: [],
      },
      locations: {
        name: 'generic_locations',
      },
    },
  },
  features: {
    agentStudio: {
      filterSuggestionsAgentID: '28a3b041-70ea-4837-9e78-d51a0fae0607',
      shoppingAssistantAgentID: '2aea6c27-1121-4932-a93f-33fc2857a73d',
      chatWidgetAgentID: '1247bc42-e49b-4a6b-803c-ca2a814a7eff',
      chatWidgetComparisonConfigurationID:
        'algolia_comparison_7ef80219-b1f5-4c29-af7f-f85e18564727',
      chatWidgetPromptSuggestionsConfigurationID:
        'algolia_prompt_suggestions_00f51d97-122b-42a9-ab79-a505e9454c48',
      questionSuggestionsAgentID: '13a8ed2c-f4bf-4c13-acd0-681fd07ead9a',
      searchFilters: true,
    },
    composition: {
      compositionId: 'comp1783604537378___furnishings_ns_prod',
    },
    recommend: {
      noResults: [
        {
          model: 'trending-items',
          title: 'Trending Now',
        },
      ],
      homepage: [{ model: 'trending-items', title: 'Trending Now' }],
      pdp: [
        { model: 'bought-together', title: 'Frequently Bought Together' },
        { model: 'related-products', title: 'Complete the Look' },
      ],
      cart: [
        { model: 'bought-together', title: 'You May Also Need' },
        { model: 'related-products', title: 'Complete the Room' },
      ],
    },
    personalization: {
      enabled: true,
      personas: PERSONAS,
    },
    orderHistory: {
      enabled: true,
      seeds: ORDER_HISTORY_SEEDS,
    },
    dynamicReRanking: {
      enabled: true,
    },
    queryCategorization: {
      enabled: true,
    },
    neuralSearch: {
      enabled: true,
    },
    intentRouting: {
      enabled: true,
    },
    dynamicFacetOrdering: {
      enabled: true,
    },
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
      title: 'Featured Items',
      ruleContexts: ['homepage-featured-furnishing'],
    },
  ],
  carouselCategories: [
    {
      category: 'Home & Kitchen > Furniture > Living Room Furniture',
      label: 'Living Room',
    },
    {
      category: 'Home & Kitchen > Furniture > Bedroom Furniture',
      label: 'Bedroom',
    },
    {
      category: 'Home & Kitchen > Furniture > Home Office Furniture',
      label: 'Home Office',
    },
    {
      category: 'Home & Kitchen > Home Décor Products',
      label: 'Décor',
    },
  ],
  collections: [
    {
      collection: 'Best Sellers',
      label: 'Best Sellers',
      description:
        'Our most popular products, loved by thousands of customers. Discover the items everyone is talking about.',
    },
    {
      collection: 'New Arrivals',
      label: 'New Arrivals',
      description:
        'Fresh picks just landed. Be the first to explore our latest additions.',
    },
  ],
}
