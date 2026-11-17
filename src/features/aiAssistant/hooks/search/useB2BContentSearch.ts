import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import {
  getB2BContentArticleHitValues,
  getB2BContentBlogHitValues,
  getB2BContentDocumentationHitValues,
  getB2BContentResourceHitValues,
} from '@/app/b2b-content/_utils/getB2BContentHitValues'
import type {
  B2BContentArticleHitTemplate,
  B2BContentBlogHitTemplate,
  B2BContentDocumentationHitTemplate,
  B2BContentResourceHitTemplate,
} from '@/app/b2b-content/types'
import type {
  AssistantSearchOptions,
  B2BContentData,
  B2BContentSearchQuery,
  B2BContentSummary,
  B2BContentType,
  UnifiedSearchResult,
} from '@/features/aiAssistant/types'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { VerticalConfig } from '@/types'
import type { PersonalizationSearchParams } from '@/utilities/personalizationParams'

import type { QueryClient } from '@tanstack/react-query'
import type { liteClient } from 'algoliasearch/lite'

type AlgoliaLiteClient = ReturnType<typeof liteClient>

interface SearchHit {
  objectID: string
  [key: string]: unknown
}

const HITS_PER_PAGE = 10

const getIndexName = (
  type: B2BContentType,
  algolia: VerticalConfig['algolia'],
): string | null => {
  switch (type) {
    case 'documentation':
      return algolia.primaryIndex?.name ?? null
    case 'articles':
      return algolia.indices.articles?.name ?? null
    case 'blogs':
      return algolia.indices.blogs?.name ?? null
    case 'resources':
      return algolia.indices.resources?.name ?? null
    default:
      return null
  }
}

const buildSummary = (data: B2BContentData): B2BContentSummary => {
  const base: B2BContentSummary = {
    objectID: data.objectID,
    type: data.type,
    title: data.title,
  }

  switch (data.type) {
    case 'documentation':
      return {
        ...base,
        description: data.description,
        category: data.category,
        contentType: data.docType,
      }
    case 'articles':
      return {
        ...base,
        category: data.category,
        section: data.section,
      }
    case 'blogs':
      return {
        ...base,
        description: data.description,
        category: data.category,
        author: data.authorDisplay,
      }
    case 'resources':
      return {
        ...base,
        contentType: data.docType,
      }
  }
}

const runB2BContentSearch = async (
  queries: B2BContentSearchQuery[],
  searchClient: AlgoliaLiteClient,
  config: VerticalConfig,
  queryClient: QueryClient,
  { personalizationParams }: AssistantSearchOptions = {},
): Promise<UnifiedSearchResult> => {
  if (!queries || queries.length === 0) {
    return { summaries: [] }
  }

  if (config.slug !== 'b2b-content') {
    return { summaries: [] }
  }

  const { primaryIndex, indices } = config.algolia
  const documentationTemplate = primaryIndex?.template as
    | B2BContentDocumentationHitTemplate
    | undefined
  const articleTemplate = indices.articles?.template as
    | B2BContentArticleHitTemplate
    | undefined
  const blogTemplate = indices.blogs?.template as
    | B2BContentBlogHitTemplate
    | undefined
  const resourceTemplate = indices.resources?.template as
    | B2BContentResourceHitTemplate
    | undefined

  // Build search requests for each query
  const searchRequests = queries
    .map((q) => {
      const indexName = getIndexName(q.index, config.algolia)
      if (!indexName) return null

      return {
        indexName,
        query: q.query,
        params: {
          ...personalizationParams,
          hitsPerPage: HITS_PER_PAGE,
        },
        // Pass filters once we add facets to the B2B Content indices
        // filters: q.filters,
        _contentType: q.index,
      }
    })
    .filter(Boolean) as Array<{
    indexName: string
    query: string
    params: PersonalizationSearchParams & { hitsPerPage: number }
    _contentType: B2BContentType
  }>

  if (searchRequests.length === 0) {
    return { summaries: [] }
  }

  // Execute multi-query search
  const response = await searchClient.search<SearchHit>(
    searchRequests.map(({ _contentType, ...req }) => req),
  )

  const contentMap = new Map<string, B2BContentData>()
  const summaries: B2BContentSummary[] = []

  // Process results from each index
  response.results.forEach((result, index) => {
    if (!('hits' in result)) return

    const contentType = searchRequests[index]._contentType

    result.hits.forEach((hit) => {
      const key = `${contentType}:${hit.objectID}`
      if (contentMap.has(key)) return

      let contentData: B2BContentData | null = null

      switch (contentType) {
        case 'documentation':
          if (documentationTemplate) {
            contentData = {
              ...getB2BContentDocumentationHitValues(
                hit,
                documentationTemplate,
                config.slug,
              ),
              type: 'documentation',
            }
          }
          break
        case 'articles':
          if (articleTemplate) {
            contentData = {
              ...getB2BContentArticleHitValues(
                hit,
                articleTemplate,
                config.slug,
              ),
              type: 'articles',
            }
          }
          break
        case 'blogs':
          if (blogTemplate) {
            contentData = {
              ...getB2BContentBlogHitValues(hit, blogTemplate, config.slug),
              type: 'blogs',
            }
          }
          break
        case 'resources':
          if (resourceTemplate) {
            contentData = {
              ...getB2BContentResourceHitValues(
                hit,
                resourceTemplate,
                config.slug,
              ),
              type: 'resources',
            }
          }
          break
      }

      if (contentData) {
        contentMap.set(key, contentData)

        // Cache per-card data so cards can read it without a second fetch
        queryClient.setQueryData(
          ['b2bContent', contentType, hit.objectID],
          contentData,
        )

        summaries.push(buildSummary(contentData))
      }
    })
  })

  return { summaries }
}

/**
 * Hook for searching B2B Content across multiple indices
 * (documentation, articles, blogs, resources).
 */
export const useB2BContentSearch = ({
  personalizationParams,
}: AssistantSearchOptions = {}) => {
  const searchClient = useAtomValue(baseSearchClientAtom)
  const config = useActiveConfig()
  const queryClient = useQueryClient()

  return useCallback(
    (queries: B2BContentSearchQuery[]): Promise<UnifiedSearchResult> => {
      if (!searchClient || !config) return Promise.resolve({ summaries: [] })
      return runB2BContentSearch(queries, searchClient, config, queryClient, {
        personalizationParams,
      })
    },
    [searchClient, config, queryClient, personalizationParams],
  )
}
