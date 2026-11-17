import { PERSONAS } from '@/app/media-entertainment/personas'
import type {
  MediaEntertainmentConfigType,
  MediaHeaderSectionConfig,
} from '@/app/media-entertainment/types'
import { WATCH_STATE_SEEDS } from '@/app/media-entertainment/watchStateSeeds'

const SLUG = 'media-entertainment'
const SEARCH_PATH = `/${SLUG}/search`

/** Exported so the Top 10 rail, My List suggestions row and assistant carousel share one string. */
export const TOP_10_RULE_CONTEXT = 'homepage_me_top_10'

/** Hoisted so `navItems` can derive its middle entries from the same list. */
const HEADER_SECTIONS: MediaHeaderSectionConfig[] = [
  {
    id: 'tv-series',
    title: 'TV Series',
    filters: 'record_type:show',
    hiddenFacets: ['record_type'],
  },
  {
    id: 'movies',
    title: 'Movies',
    filters: 'record_type:movie',
    hiddenFacets: ['record_type'],
  },
  {
    id: 'new-popular',
    title: 'New & Popular',
    filterRuleContexts: ['homepage_me_new_releases'],
  },
]

export const mediaEntertainmentConfig: MediaEntertainmentConfigType = {
  slug: SLUG,
  name: 'Media & Entertainment',
  description:
    'A streaming catalogue for browsing and discovering films and series.',
  assets: {
    favicon: '/images/media-entertainment/media-favicon.webp',
    logo: '/images/media-entertainment/media-logo.webp',
    banner: '',
  },
  theme: 'media-entertainment',
  darkMode: true,
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'media_ns',
      replicas: [
        { label: 'Rating: High to Low', indexName: 'media_ns_rating_desc' },
      ],
      template: {
        attributes: {
          title: 'title',
          tagline: 'tagline',
          overview: 'overview',
          type: 'record_type',
          genres: 'genres',
          keywords: 'keywords',
          releaseYear: 'release_date_str',
          runtime: 'runtime',
          maturityRating: 'certification',
          seasonCount: 'number_of_seasons',
          episodeCount: 'number_of_episodes',
          seasons: 'seasons',
          poster: 'poster_path',
          backdrop: 'backdrop_path',
          cast: 'cast',
          directors: 'directors',
          rating: 'vote_average',
          ratingCount: 'vote_count',
          popularity: 'popularity',
        },
        imageHrefPrefix: 'https://image.tmdb.org/t/p/w500',
      },
      facets: [
        { attribute: 'genres', label: 'Genre', type: 'refinement' },
        { attribute: 'record_type', label: 'Type', type: 'refinement' },
        { attribute: 'certification', label: 'Rated', type: 'refinement' },
      ],
    },
    indices: {},
  },
  features: {
    agentStudio: {
      shoppingAssistantAgentID: 'fed917d5-ed63-4597-8ef9-8e64be7d52be',
      chatWidgetAgentID: 'e999eccc-0869-443f-81b3-899c2d8ca2d2',
      // Off on purpose. `certification` on this index mixes two dozen national
      // rating schemes, so a live facet dump would tell the agent that "18", "L"
      // and "-16" are interchangeable values. The curated vocabulary lives in
      // the agent's system prompt instead.
      searchFilters: false,
    },
    composition: {
      compositionId: 'comp1788353565451___media_ns',
      multiFeedCompositionId: 'media_multifeed',
    },
    neuralSearch: {
      enabled: true,
    },
    personalization: {
      enabled: true,
      personas: PERSONAS,
    },
    dynamicReRanking: {
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
      shoppingAssistantAgentID: '64293837-ac7e-4505-8f79-84a6be6e9b27',
      chatWidgetAgentID: '',
    },
  },
  assistant: {
    qualityFloor: 200,
    restrictedProfileIds: ['kids-family'],
    prompts: [
      'Something light and funny for tonight',
      "A thriller with a twist I won't see coming",
      'A series I can binge this weekend',
      'Highly rated sci-fi I probably missed',
    ],
  },
  watchStateSeeds: WATCH_STATE_SEEDS,
  headerSections: HEADER_SECTIONS,
  navItems: [
    { label: 'Home', href: `/${SLUG}` },
    ...HEADER_SECTIONS.map((section) => {
      return {
        label: section.title,
        href: `${SEARCH_PATH}/${section.id}`,
      }
    }),
    { label: 'My List', href: `/${SLUG}/my-list` },
  ],
  homepageRails: [
    {
      id: 'top-10',
      title: 'Top 10 Today',
      shape: 'top10',
      hitsPerPage: 10,
      filterRuleContexts: [TOP_10_RULE_CONTEXT],
    },
    {
      id: 'because-you-watched',
      source: 'recommend',
      title: 'Because you watched',
      hitsPerPage: 14,
    },
    {
      id: 'new-releases',
      title: 'New Releases',
      shape: 'backdrop',
      filterRuleContexts: ['homepage_me_new_releases'],
    },
    {
      id: 'sw-originals',
      title: 'S&W Originals',
      shape: 'spotlight',
      filterRuleContexts: ['homepage_me_originals'],
    },
    {
      id: 'blockbusters',
      title: 'Blockbuster Movies',
      filterRuleContexts: ['homepage_me_blockbusters'],
    },
    {
      id: 'binge-series',
      title: 'Binge-Worthy Series',
      filterRuleContexts: ['homepage_me_binge_series'],
    },
    {
      id: 'sci-fi',
      title: 'Sci-Fi & Fantasy',
      filterRuleContexts: ['homepage_me_sci_fi'],
    },
    {
      id: 'family-night',
      title: 'Family Movie Night',
      filterRuleContexts: ['homepage_me_family_night'],
    },
  ],
  homepageRailDiscovery: {
    contextPrefix: 'homepage_me_',
    maxDiscovered: 6,
  },
  myListSuggestionsRail: {
    id: 'my-list-suggestions',
    title: 'Trending Now',
    filterRuleContexts: [TOP_10_RULE_CONTEXT],
    hitsPerPage: 12,
  },
}
