'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { getArticleCardAttributes } from '@/app/fashion/_utils/getArticleCardAttributes'
import { getFashionArticleHitValues } from '@/app/fashion/_utils/getFashionArticleHitValues'
import { fashionConfig } from '@/app/fashion/config'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { searchClientAtom } from '@/stores/searchClient'

type ArticleHit = Record<string, unknown>

// Stable empty reference — callers memoise AI context off this array.
const NO_ARTICLES: FashionArticleHitValues[] = []

interface UseFashionArticlesOptions {
  /** Separates cache entries between call sites. */
  key: string
  count: number
  /** Algolia filter expression, part of the cache key. */
  filters?: string
  /** Pass false to stay idle when a required filter could not be built. */
  enabled?: boolean
}

// Hits stay in the order Algolia returned them — reordering client-side would
// desync hit positions from the ones reported to Insights. Ranking belongs in
// the index (customRanking or a date replica), never here.

export const useFashionArticles = ({
  key,
  count,
  filters,
  enabled = true,
}: UseFashionArticlesOptions) => {
  const searchClient = useAtomValue(searchClientAtom)
  const { algolia, slug } = fashionConfig
  const articlesIndex = algolia.indices.articles
  const template = articlesIndex.template

  const { data, isLoading } = useQuery<FashionArticleHitValues[]>({
    queryKey: [key, slug, articlesIndex.name, count, filters],
    queryFn: async () => {
      if (!searchClient || !template) {
        throw new Error('Search client or articles template not available')
      }

      const { results } = await searchClient.search<ArticleHit>([
        {
          indexName: articlesIndex.name,
          params: {
            ...(filters ? { filters } : {}),
            hitsPerPage: count,
            attributesToRetrieve: getArticleCardAttributes(template),
            attributesToHighlight: [],
          },
        },
      ])

      const result = results[0]
      if (!result || !('hits' in result)) return []

      return result.hits.map((hit) =>
        getFashionArticleHitValues(hit, template, slug),
      )
    },
    enabled: enabled && !!searchClient && !!template,
    staleTime: 1000 * 60 * 5,
  })

  return { articles: data ?? NO_ARTICLES, isLoading }
}
