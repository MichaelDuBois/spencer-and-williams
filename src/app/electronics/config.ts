import { navCategories } from '@/app/electronics/navCategories'
import { ORDER_HISTORY_SEEDS } from '@/app/electronics/orderHistorySeeds'
import { PERSONAS } from '@/app/electronics/personas'
import type { ElectronicsConfigType } from '@/app/electronics/types'

const HIERARCHICAL_CATEGORY_LEVELS = [
  'hierarchicalCategories.level0',
  'hierarchicalCategories.level1',
  'hierarchicalCategories.level2',
  'hierarchicalCategories.level3',
  'hierarchicalCategories.level4',
  'hierarchicalCategories.level5',
] as const

export const electronicsConfig: ElectronicsConfigType = {
  slug: 'electronics',
  name: 'Electronics',
  description:
    'A modern consumer electronics storefront with product search, rich technical facets, and a streamlined shopping experience.',
  assets: {
    favicon: '/images/electronics/electronics-favicon.svg',
    logo: '/images/electronics/electronics-logo.svg',
    banner: '/images/electronics/electronics-banner.webp',
  },
  theme: 'electronics',
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'electronics_ns_prod',
      replicas: [
        {
          label: 'Price: Low to High',
          indexName: 'electronics_ns_prod_price_asc',
        },
        {
          label: 'Price: High to Low',
          indexName: 'electronics_ns_prod_price_desc',
        },
        {
          label: 'Ratings: High to Low',
          indexName: 'electronics_ns_prod_ratings_desc',
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
          rating: 'rating',
          ratingsCount: 'ratingsCount',
          sales: 'sales',
          screenSize: 'attrs.Screen Size',
          storage: 'attrs.Memory Storage Capacity',
          hardDiskSize: 'attrs.Hard Disk Size',
          os: 'attrs.Operating System',
          cpu: 'attrs.CPU Model',
          ram: 'attrs.Ram Memory Installed Size',
          graphics: 'attrs.Graphics Coprocessor',
          color: 'attrs.Color',
          condition: 'attrs.Condition',
          warranty: 'attrs.Warranty',
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
        { attribute: 'attrs.Type', label: 'Type', type: 'refinement' },
        { attribute: 'attrs.Style', label: 'Style', type: 'refinement' },
      ],
    },
    indices: {
      querySuggestions: {
        name: 'electronics_ns_prod_query_suggestions',
        facets: [],
      },
      aiSuggestions: {
        name: 'electronics_ai_suggestions',
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
      chatWidgetAgentID: '18fed5ef-6044-4423-aae2-a3e33fc1962d',
      chatWidgetComparisonConfigurationID:
        'algolia_comparison_964e858c-68da-4711-8ed9-f92a3c30eadd',
      chatWidgetPromptSuggestionsConfigurationID:
        'algolia_prompt_suggestions_30ffe4ca-5d1e-4951-86dd-b04aab6bcb76',
      questionSuggestionsAgentID: '13a8ed2c-f4bf-4c13-acd0-681fd07ead9a',
      searchFilters: true,
    },
    composition: {
      compositionId: 'comp1783604488444___electronics_ns_prod',
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
    neuralSearch: {
      enabled: true,
    },
    intentRouting: {
      enabled: true,
    },
    dynamicReRanking: {
      enabled: true,
    },
    queryCategorization: {
      enabled: true,
    },
    personalization: {
      enabled: true,
      personas: PERSONAS,
    },
    orderHistory: {
      enabled: true,
      seeds: ORDER_HISTORY_SEEDS,
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
      ruleContexts: ['homepage-featured-electronics'],
    },
  ],
  carouselCategories: [
    {
      category: 'Cell Phones & Accessories > Cell Phones',
      label: 'Cell Phones',
    },
    {
      category: 'Electronics > Television & Video',
      label: 'Television & Video',
    },
    {
      category: 'Electronics > Wearable Technology',
      label: 'Wearable Technology',
    },
    { category: 'Electronics > Camera & Photo', label: 'Camera & Photo' },
  ],
  collections: [
    {
      collection: 'Best Sellers',
      label: 'Best Sellers',
      description:
        'Our most popular electronics, trusted by thousands of shoppers. Discover the tech everyone is buying.',
    },
    {
      collection: 'New Arrivals',
      label: 'New Arrivals',
      description:
        'Fresh tech just landed, be the first to explore our latest additions.',
    },
  ],
}
