'use client'

import { Configure, Index } from 'react-instantsearch'

import { getArticleCardAttributes } from '@/app/fashion/_utils/getArticleCardAttributes'
import { fashionConfig } from '@/app/fashion/config'
import { toAlgoliaFilterStringLiteral } from '@/utilities/algoliaFilters'

/** Identifies the articles feed inside the parent index's `scopedResults`. */
export const INLINE_ARTICLE_INDEX_ID = 'fashion_inline_article'

interface InlineArticleIndexProps {
  category?: string
  isEnabled: boolean
}

/**
 * Adds the articles index to the surrounding InstantSearch tree so its query
 * rides along in the same batched request as the products, inheriting the
 * search query for free. Renders nothing — `useInlineArticle` reads the hit
 * back out of `scopedResults`.
 */
export const InlineArticleIndex = ({
  category,
  isEnabled,
}: InlineArticleIndexProps) => {
  const { algolia } = fashionConfig
  const articlesIndex = algolia.indices.articles
  const template = articlesIndex.template

  if (!template) return null

  const relatedCategoriesAttribute = template.attributes.relatedCategories
  const filters =
    category && typeof relatedCategoriesAttribute === 'string'
      ? `${relatedCategoriesAttribute}:${toAlgoliaFilterStringLiteral(category)}`
      : ''

  return (
    <Index indexName={articlesIndex.name} indexId={INLINE_ARTICLE_INDEX_ID}>
      <Configure
        hitsPerPage={isEnabled ? 1 : 0}
        filters={filters}
        attributesToRetrieve={getArticleCardAttributes(template)}
        attributesToHighlight={[]}
      />
    </Index>
  )
}
