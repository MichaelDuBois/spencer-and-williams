'use client'

import { useParams } from 'next/navigation'

import { useConnectedProducts } from '@/app/fashion/_hooks/useConnectedProducts'
import { getFashionArticleHitValues } from '@/app/fashion/_utils/getFashionArticleHitValues'
import { FashionArticlePageContent } from '@/app/fashion/article/[id]/_components'
import { fashionConfig } from '@/app/fashion/config'
import { PdpLoadingState } from '@/components/pdp/PdpLoadingState'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { useSetProductContext } from '@/features/aiAssistant/hooks/useSetProductContext'
import { fashionContentContextState } from '@/features/aiAssistant/stores/aiAssistant'
import { useExtractedHit } from '@/hooks/useExtractedHit'

const FashionArticlePage = () => {
  const params = useParams()
  const articleId = params.id as string
  const { slug, algolia } = fashionConfig
  const articlesIndex = algolia.indices.articles

  const {
    data: article,
    isLoading,
    isError,
  } = useExtractedHit(articleId ?? '', {
    template: articlesIndex.template,
    extractor: getFashionArticleHitValues,
    indexName: articlesIndex.name,
  })

  const { products, isLoading: isProductsLoading } = useConnectedProducts(
    article?.relatedProducts ?? [],
  )

  useSetProductContext(fashionContentContextState, article ?? null)

  if (isLoading) {
    return <PdpLoadingState />
  }

  if (isError || !article) {
    return (
      <PdpNotFoundState
        eyebrow="Article unavailable"
        title="We couldn't find that story."
        backHref={`/${slug}/search`}
        backLabel="Back to collection"
      />
    )
  }

  return (
    <FashionArticlePageContent
      article={article}
      products={products}
      isProductsLoading={isProductsLoading}
    />
  )
}

export default FashionArticlePage
