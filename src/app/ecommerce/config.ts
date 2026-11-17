import { navCategories } from '@/app/ecommerce/navCategories'
import { ORDER_HISTORY_SEEDS } from '@/app/ecommerce/orderHistorySeeds'
import { PERSONAS } from '@/app/ecommerce/personas'
import type { EcommerceConfigType } from '@/app/ecommerce/types'

const HIERARCHICAL_CATEGORY_LEVELS = [
  'hierarchicalCategories.level0',
  'hierarchicalCategories.level1',
  'hierarchicalCategories.level2',
  'hierarchicalCategories.level3',
  'hierarchicalCategories.level4',
  'hierarchicalCategories.level5',
] as const

export const ecommerceConfig: EcommerceConfigType = {
  slug: 'ecommerce',
  name: 'Ecommerce',
  description:
    'A standard storefront experience with product listings, search, and shopping cart functionality.',
  assets: {
    favicon: '/images/ecommerce/ecommerce-favicon.svg',
    logo: '/images/ecommerce/ecommerce-logo.svg',
    banner: '/images/ecommerce/ecommerce-banner.webp',
  },
  theme: 'ecommerce',
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'ecommerce_ns_prod',
      replicas: [
        {
          label: 'Price: High to Low',
          indexName: 'ecommerce_ns_prod_price_desc',
        },
        {
          label: 'Ratings: High to Low',
          indexName: 'ecommerce_ns_prod_ratings_desc',
        },
        {
          label: 'New Arrivals',
          indexName: 'ecommerce_ns_prod_isNew_desc',
        },
        {
          label: 'Best Sellers',
          indexName: 'ecommerce_ns_prod_sales_desc',
        },
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
      ],
    },
    indices: {
      querySuggestions: {
        name: 'ecommerce_ns_prod_query_suggestions',
        facets: [],
      },
      aiSuggestions: {
        name: 'ai_suggestions',
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
      chatWidgetAgentID: 'f07ac010-6306-4ad9-ac2c-1e3c5b921544',
      chatWidgetComparisonConfigurationID:
        'algolia_comparison_8bc206ca-d835-4503-b25a-561932e46e2e',
      chatWidgetPromptSuggestionsConfigurationID:
        'algolia_prompt_suggestions_4e1fd1b6-159d-4ec5-bc3e-4fcd90803946',
      questionSuggestionsAgentID: '13a8ed2c-f4bf-4c13-acd0-681fd07ead9a',
      searchFilters: true,
    },
    composition: {
      compositionId: 'comp1777992580711___ecommerce_ns_prod',
      multiFeedCompositionId: 'comp1781604057376___ecommerce_ns_prod',
    },
    recommend: {
      noResults: [
        {
          model: 'trending-items',
          title: 'Trending Items',
        },
      ],
      pdp: [
        { model: 'bought-together', title: 'Frequently Bought Together' },
        { model: 'related-products', title: 'Related Products' },
      ],
      cart: [{ model: 'bought-together', title: 'Frequently Bought Together' }],
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
      ruleContexts: ['homepage_featured_ecommerce'],
    },
  ],
  carouselCategories: [
    { category: 'Electronics', label: 'Electronics' },
    {
      category: 'Clothing, Shoes & Jewelry',
      label: 'Clothing, Shoes & Jewelry',
    },
    {
      category: 'Home & Kitchen > Kitchen & Dining',
      label: 'Kitchen & Dining',
    },
    { category: 'Sports & Outdoors', label: 'Sports' },
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
