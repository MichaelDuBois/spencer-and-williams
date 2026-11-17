import { navCategories } from '@/app/grocery/navCategories'
import { ORDER_HISTORY_SEEDS } from '@/app/grocery/orderHistorySeeds'
import { PERSONAS } from '@/app/grocery/personas'
import type { GroceryConfigType } from '@/app/grocery/types'

const HIERARCHICAL_CATEGORY_LEVELS = [
  'hierarchicalCategories.level0',
  'hierarchicalCategories.level1',
  'hierarchicalCategories.level2',
] as const

export const groceryConfig: GroceryConfigType = {
  slug: 'grocery',
  name: 'Grocery',
  description:
    'A fresh grocery shopping experience with product search, categories, and a seamless checkout flow.',
  assets: {
    favicon: '/images/grocery/grocery-favicon.svg',
    logo: '/images/grocery/grocery-logo.svg',
    banner: '/images/grocery/grocery-banner.webp',
  },
  theme: 'grocery',
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'grocery_prod_ns',
      replicas: [
        {
          label: 'Price: Low to High',
          indexName: 'grocery_prod_ns_price_asc',
        },
        {
          label: 'Price: High to Low',
          indexName: 'grocery_prod_ns_price_desc',
        },
      ],
      template: {
        attributes: {
          name: 'name',
          image: 'image',
          price: 'price',
          brand: 'brand',
          description: 'description',
          category: 'type',
          hierarchicalCategories: HIERARCHICAL_CATEGORY_LEVELS,
          rating: 'rating',
          ratingsCount: 'ratingsCount',
          popularity: 'popularity',
          sales: 'sales',
          storeBrand: 'storeBrand',
          isFood: 'isFood',
          type: 'type',
          keywords: 'keywords',
          weight: 'weight',
          nutrition: 'nutrition',
          availableInStores: 'availableInStores',
          semanticAttributes: 'semantic_attributes',
        },
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
        { attribute: 'storeBrand', label: 'Store Brand', type: 'refinement' },
      ],
    },
    indices: {
      querySuggestions: {
        name: 'grocery_prod_ns_query_suggestions',
        facets: [],
      },
      aiSuggestions: {
        name: 'grocery_ai_suggestions',
        facets: [],
      },
      locations: {
        name: 'generic_locations',
      },
      recipes: {
        name: 'grocery_recipes',
        template: {
          attributes: {
            name: 'name',
            image: 'image',
            description: 'description',
            attrs: 'attrs',
            steps: 'steps',
          },
        },
      },
    },
  },
  features: {
    agentStudio: {
      filterSuggestionsAgentID: '28a3b041-70ea-4837-9e78-d51a0fae0607',
      shoppingAssistantAgentID: '2aea6c27-1121-4932-a93f-33fc2857a73d',
      chatWidgetAgentID: '52d1e460-563a-4b60-b405-e3341b622e8d',
      chatWidgetComparisonConfigurationID:
        'algolia_comparison_d9a9626d-1885-47ff-b1c5-b5f72acce778',
      chatWidgetPromptSuggestionsConfigurationID:
        'algolia_prompt_suggestions_1077271f-92a4-42ef-a1cd-b6b41a1dfedb',
      questionSuggestionsAgentID: '13a8ed2c-f4bf-4c13-acd0-681fd07ead9a',
      searchFilters: true,
    },
    composition: {
      compositionId: 'comp1781526489218___grocery_prod_ns',
    },
    recommend: {
      noResults: [
        {
          model: 'trending-items',
          title: 'Trending This Week',
        },
      ],
      homepage: [{ model: 'trending-items', title: 'Trending This Week' }],
      pdp: [{ model: 'related-products', title: 'You Might Also Like' }],
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
      ruleContexts: ['homepage-featured-grocery'],
    },
  ],
  collections: [
    {
      collection: 'Best Sellers',
      label: 'Best Sellers',
      description:
        'Our most popular grocery items, loved by shoppers everywhere.',
    },
    {
      collection: 'S&W Picks',
      label: 'Spencer & Williams Picks',
      description:
        'Quality you can trust — our hand-selected store brand favorites at great value.',
    },
  ],
}
