'use client'

import { useParams } from 'next/navigation'

import { B2BContentAiSummary } from '@/app/b2b-content/_components/B2BContentAiSummary'
import { ContentPDPStructuredBody } from '@/app/b2b-content/_components/pdpComponents/ContentPDPStructuredBody'
import { getB2BContentArticleHitValues } from '@/app/b2b-content/_utils/getB2BContentHitValues'
import {
  B2BArticleCta,
  B2BArticleHeader,
  B2BArticleMeta,
  B2BArticlePills,
} from '@/app/b2b-content/articles/[id]/_components'
import { b2bContentConfig } from '@/app/b2b-content/config'
import { PdpLoadingState } from '@/components/pdp/PdpLoadingState'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { useExtractedHit } from '@/hooks/useExtractedHit'

const template = b2bContentConfig.algolia.indices.articles.template!

const ArticlePage = () => {
  const params = useParams()
  const id = decodeURIComponent(String(params.id ?? ''))
  const { slug } = b2bContentConfig

  const {
    data: article,
    isLoading,
    isError,
  } = useExtractedHit(id, {
    template,
    extractor: getB2BContentArticleHitValues,
    indexName: b2bContentConfig.algolia.indices.articles.name,
  })

  if (isLoading) {
    return <PdpLoadingState />
  }

  if (isError || !article) {
    return (
      <PdpNotFoundState
        title="Article not found"
        backHref={`/${slug ?? 'b2b-content'}/search/articles`}
        backLabel="Back to articles"
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <B2BArticleHeader article={article} />
      <B2BArticlePills article={article} />
      <B2BArticleMeta article={article} />
      <B2BContentAiSummary article={article} />
      <ContentPDPStructuredBody blocks={article.body} />
      <B2BArticleCta article={article} />
    </div>
  )
}

export default ArticlePage
