import { PERSONAS } from '@/app/travel/personas'
import type { TravelMediaConfigType } from '@/app/travel/types'

const INDICES: TravelMediaConfigType['algolia']['indices'] = {
  podcasts: {
    name: 'travel_media_podcasts',
    template: {
      attributes: {
        title: 'title',
        image: 'cover_image',
        episode: 'episode',
        summary: 'summary',
        hosts: 'host_names',
        guests: 'guest_names',
        episodeNumber: 'episode_number',
        duration: 'time_to_listen_minutes',
        category: 'category',
        publishedAt: 'published_at',
        tags: 'tags',
        topics: 'topics',
        transcript: 'transcript',
        keyQuotes: 'key_quotes',
      },
    },
    facets: [
      { attribute: 'category', label: 'Category', type: 'refinement' },
      { attribute: 'tags', label: 'Tags', type: 'refinement' },
      {
        attribute: 'time_to_listen_minutes',
        label: 'Duration (minutes)',
        type: 'slider',
        defaultOpen: true,
      },
    ],
  },
  activities: {
    name: 'travel_media_related_activities',
    template: {
      attributes: {
        title: 'title',
        image: 'image',
        subtitle: 'subtitle',
        description: 'description',
        location: 'location',
        country: 'country',
        duration: 'travel_time_minutes',
        rating: 'rating',
        parentID: 'parentID',
        _geoloc: '_geoloc',
      },
    },
  },
  aiSuggestions: {
    name: 'travel_ai_suggestions',
    facets: [],
  },
}

export const travelConfig: TravelMediaConfigType = {
  slug: 'travel',
  name: 'Travel Media',
  description:
    'A travel media website featuring articles, guides, and tips for travelers.',
  assets: {
    favicon: '/images/travel/S&W - Travel - Monogram.svg',
    logo: '/images/travel/S&W - Travel - logo.svg',
    banner: '/images/travel/Banner V2 - Travel - HD.webp',
  },
  theme: 'travel',
  algolia: {
    searchRouteIndices: { '/travel/search/podcasts': 'podcasts' },
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'travel_media_articles',
      template: {
        attributes: {
          title: 'title',
          image: 'image',
          subtitle: 'subtitle',
          category: 'category',
          author: 'author',
          date: 'created_at',
          readTime: 'time_to_read',
          destinationType: 'destination_type',
          season: 'season',
          budget: 'budget',
          recommendedDurationDays: 'recommended_duration_days',
          aiSummary: 'ai_summary',
          location: 'location',
          tags: 'tags',
          body: 'body',
          keyQuotes: 'key_quotes',
          relatedActivities: 'related_activities',
          _geoloc: '_geoloc',
        },
      },
      facets: [
        { attribute: 'season', label: 'Season', type: 'refinement' },
        { attribute: 'budget', label: 'Budget', type: 'refinement' },
        { attribute: 'location.region', label: 'Region', type: 'refinement' },
        {
          attribute: 'recommended_duration_days',
          label: 'Duration (days)',
          type: 'slider',
          defaultOpen: true,
        },
      ],
    },
    indices: INDICES,
  },
  homepageCarousels: [
    {
      title: 'Featured Articles',
      ruleContexts: ['homepage_travel_featured_articles'],
      indexName: 'travel_media_articles',
    },
  ],
  features: {
    agentStudio: {
      filterSuggestionsAgentID: '28a3b041-70ea-4837-9e78-d51a0fae0607',
      shoppingAssistantAgentID: '7f755906-e710-4ed6-a3a3-d06fa843ef02',
      chatWidgetAgentID: '881f4bf8-0569-4ea5-b7a0-84a3206596c2',
      questionSuggestionsAgentID: '',
      summaryAgentID: 'facf5de1-3476-4fec-8262-738d953076c2',
      chatWidgetIndexNames: [INDICES.podcasts.name, INDICES.activities.name],
    },
    composition: {
      multiFeedCompositionId: 'comp1781603877066___travel_media_articles',
    },
    personalization: {
      enabled: true,
      personas: PERSONAS,
    },
    neuralSearch: {
      enabled: true,
    },
    // Off deliberately: search-as-you-type carries the SRP here, so Enter
    // handing the query to the assistant would interrupt a working flow.
    intentRouting: {
      enabled: false,
    },
  },
  staging: {
    appId: 'TMALC8UD1C',
    apiKey: 'ae488ca7686a43117b40cd6da128f03c',
    agentStudio: {
      filterSuggestionsAgentID: '7dd45d56-e8ac-4415-85dc-4ed5d8692b1d',
      shoppingAssistantAgentID: '230ca9a4-01c3-4d17-a34b-7decfc868483',
      chatWidgetAgentID: '',
      summaryAgentID: '07d7253d-fbe2-4c05-a8da-5a479cea41c9',
    },
  },
}
