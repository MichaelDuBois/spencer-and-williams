import { navCategories } from '@/app/fashion/navCategories'
import { ORDER_HISTORY_SEEDS } from '@/app/fashion/orderHistorySeeds'
import { PERSONAS } from '@/app/fashion/personas'
import type { FashionConfigType } from '@/app/fashion/types'

const HIERARCHICAL_CATEGORY_LEVELS = [
  'hierarchical_categories.lvl0',
  'hierarchical_categories.lvl1',
  'hierarchical_categories.lvl2',
] as const

export const fashionConfig: FashionConfigType = {
  slug: 'fashion',
  name: 'Fashion',
  description:
    'An editorial-style fashion boutique with a magazine-inspired layout and curated collections.',
  assets: {
    favicon: '/images/fashion/fashion-favicon.svg',
    logo: '/images/fashion/fashion-logo.svg',
    banner: '/images/fashion/fashion-banner.webp',
  },
  theme: 'fashion',
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'fashion_ns',
      replicas: [
        { label: 'Price: Low to High', indexName: 'fashion_ns_price_asc' },
        { label: 'Price: High to Low', indexName: 'fashion_ns_price_desc' },
      ],
      template: {
        attributes: {
          name: 'name',
          image: 'primary_image',
          images: 'image_urls',
          price: 'price.value',
          brand: 'brand',
          description: 'description',
          sizes: 'available_sizes',
          color: 'color.original_name',
          colorVariants: 'variants',
          rating: 'reviews.rating',
          reviewsCount: 'reviews.count',
          productInfo: 'product_info',
          hierarchicalCategories: HIERARCHICAL_CATEGORY_LEVELS,
          availableInStores: 'availableInStores',
        },
      },
      facets: [
        {
          attribute: HIERARCHICAL_CATEGORY_LEVELS,
          label: 'Category',
          type: 'hierarchical',
        },
        { attribute: 'brand', label: 'Brand', type: 'refinement' },
        { attribute: 'gender', label: 'Gender', type: 'refinement' },
        { attribute: 'color.filter_group', label: 'Color', type: 'color' },
        { attribute: 'available_sizes', label: 'Size', type: 'size' },
        {
          attribute: 'price.value',
          label: 'Price',
          type: 'slider',
          prefix: '$',
          defaultOpen: true,
        },
      ],
    },
    indices: {
      querySuggestions: {
        name: 'fashion_ns_query_suggestions',
        facets: [],
      },
      aiSuggestions: {
        name: 'fashion_ai_suggestions',
        facets: [],
      },
      locations: {
        name: 'generic_locations',
      },
      articles: {
        name: 'fashion_articles',
        template: {
          attributes: {
            title: 'title',
            subtitle: 'subtitle',
            image: 'banner_image',
            thumbnail: 'thumbnail_image',
            category: 'category',
            author: 'author',
            publishedAt: 'published_at',
            publishedAtTimestamp: 'published_at_timestamp',
            readingTime: 'reading_time',
            seasonality: 'seasonality',
            tags: 'tags',
            excerpt: 'excerpt',
            aiSummary: 'ai_summary',
            keyQuotes: 'key_quotes',
            body: 'body',
            relatedCategories: 'related_categories',
            relatedProducts: 'related_products',
            promoted: 'promoted',
          },
        },
      },
    },
  },
  features: {
    showInlineArticles: true,
    agentStudio: {
      filterSuggestionsAgentID: '28a3b041-70ea-4837-9e78-d51a0fae0607',
      shoppingAssistantAgentID: '2aea6c27-1121-4932-a93f-33fc2857a73d',
      chatWidgetAgentID: 'e77599b3-d686-454e-b9d6-bb7a90da2729',
      chatWidgetComparisonConfigurationID:
        'algolia_comparison_2d2fe01d-d37a-4828-8aee-b2de7a545bf9',
      chatWidgetPromptSuggestionsConfigurationID:
        'algolia_prompt_suggestions_007ab691-bd06-4ea9-9fef-eb1ab4c7bbbd',
      questionSuggestionsAgentID: '13a8ed2c-f4bf-4c13-acd0-681fd07ead9a',
      summaryAgentID: 'b6747a8d-4fc7-4208-bac9-a74bc819024b',
      searchFilters: true,
    },
    composition: {
      compositionId: 'comp1780318016972___fashion_ns',
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
        { model: 'related-products', title: 'You May Also Like' },
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
    distinct: {
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
      summaryAgentID: '3d00ba03-b5b1-47a5-8d40-9dd9d8455128',
    },
  },
  merchandising: {
    categoryAttribute: 'categoryPageId',
    nestedSeparator: ' > ',
  },
  navigation: navCategories,
  homepageCarousels: [
    {
      title: 'Trending Items',
      ruleContexts: ['homepage-trending-fashion'],
    },
  ],
  collections: [
    { collection: 'Best Sellers', label: 'Best Sellers' },
    { collection: 'Smart Buys', label: 'Bag Collection' },
    { collection: 'Gifts', label: 'Gifts' },
  ],
}
