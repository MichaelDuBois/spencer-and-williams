import { PERSONAS } from '@/app/b2b-content/personas'
import type { B2BContentConfigType } from '@/app/b2b-content/types'

const HIERARCHICAL_CATEGORY_LEVELS = [
  'content_structure.lvl0',
  'content_structure.lvl1',
  'content_structure.lvl2',
  'content_structure.lvl3',
  'content_structure.lvl4',
  'content_structure.lvl5',
] as const

const INDICES: B2BContentConfigType['algolia']['indices'] = {
  articles: {
    name: 'documentation_zendesk_2025',
    template: {
      attributes: {
        title: 'title',
        body: 'data_transformed',
        category: 'category.name',
        section: 'section.name',
        updatedAt: 'updated_at',
        promoted: 'promoted',
        outdated: 'outdated',
        voteSum: 'vote_sum',
        voteCount: 'vote_count',
        breadcrumb: 'hierarchy',
        labels: 'label_names',
        url: 'url',
      },
    },
    facets: [
      { attribute: 'category.name', label: 'Category', type: 'refinement' },
    ],
  },
  blogs: {
    name: 'documentation_blogs_2026',
    template: {
      attributes: {
        title: 'title',
        description: 'description',
        body: 'data_transformed',
        publishedAt: 'publishDate',
        authorDisplay: 'authors',
        category: 'blogcategory',
        image: 'blogimage',
        url: 'rewriteurl',
      },
      imageHrefPrefix: 'https://www.algolia.com/files/live/',
    },
    facets: [
      { attribute: 'blogcategory', label: 'Category', type: 'refinement' },
      { attribute: 'authors.name', label: 'Authors', type: 'refinement' },
    ],
  },
  resources: {
    name: 'documentation_resource_2026',
    template: {
      attributes: {
        title: 'title',
        description: 'description',
        body: 'data_transformed',
        docType: 'resourceType',
        contentType: 'contentType',
        publishedAt: 'publishDate',
        url: 'rewriteurl',
        relatedProducts: 'relatedProducts',
        relatedIndustries: 'relatedIndustries',
        relatedUseCases: 'relatedUseCases',
        image: 'thumbnailImage',
      },
      imageHrefPrefix: 'https://www.algolia.com/files/live/',
    },
    facets: [
      {
        attribute: 'contentType',
        label: 'Content Type',
        type: 'refinement',
      },
      {
        attribute: 'relatedProducts',
        label: 'Related Products',
        type: 'refinement',
      },
      {
        attribute: 'relatedIndustries',
        label: 'Related Industries',
        type: 'refinement',
      },
      {
        attribute: 'relatedUseCases',
        label: 'Related Use Cases',
        type: 'refinement',
      },
    ],
  },
  aiSuggestions: {
    name: 'b2b_content_ai_suggestions',
    facets: [],
  },
}

export const b2bContentConfig: B2BContentConfigType = {
  slug: 'b2b-content',
  name: 'B2B Content',
  description:
    'A simple business-to-business experience focused on solution discovery, service workflows, and account-based buying.',
  assets: {
    favicon: '/images/b2b-content/S&W - B2B Content - Monogram.svg',
    logo: '/images/b2b-content/S&W - B2B Content - logo.svg',
    banner: '',
  },
  theme: 'b2b-content',
  algolia: {
    appId: 'O5P8ZGQT18',
    apiKey: '35a16ba8d14fb372755a48924eb62ee6',
    primaryIndex: {
      name: 'documentation_algolia_2025',
      template: {
        attributes: {
          title: 'title',
          description: 'description',
          category: 'category',
          docType: 'type',
          pageTitle: 'page_title',
          variations: 'variations',
          url: 'url',
          breadcrumb: 'content_structure',
        },
      },
      facets: [
        {
          attribute: HIERARCHICAL_CATEGORY_LEVELS,
          label: 'Content Structure',
          type: 'hierarchical',
        },
        { attribute: 'languages', label: 'Languages', type: 'refinement' },
        {
          attribute: 'details.integration',
          label: 'Integration',
          type: 'refinement',
        },
        { attribute: 'tags', label: 'Tags', type: 'refinement' },
        { attribute: 'type', label: 'Type', type: 'refinement' },
      ],
    },
    indices: INDICES,
  },
  homepageCarousels: [
    {
      title: 'Featured Algolia Blogs',
      ruleContexts: ['homepage_featured_blogs'],
      indexName: 'documentation_blogs_2026',
    },
  ],
  features: {
    agentStudio: {
      filterSuggestionsAgentID: '28a3b041-70ea-4837-9e78-d51a0fae0607',
      shoppingAssistantAgentID: '17f453c1-d3db-4f7f-a5d0-6ec9e99f84d9',
      chatWidgetAgentID: '5a89be93-059d-44e8-849d-fd2fd3d752ae',
      summaryAgentID: 'aa5bdba9-a7c1-4744-99be-c09c7ced20e5',
      chatWidgetIndexNames: [
        INDICES.articles.name,
        INDICES.blogs.name,
        INDICES.resources.name,
      ],
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
      shoppingAssistantAgentID: 'f293fc15-6060-4079-afb4-5378d49c49f1',
      chatWidgetAgentID: '',
      summaryAgentID: '61a28e82-6593-4c5e-b8bc-72b86d667242',
    },
  },
}
