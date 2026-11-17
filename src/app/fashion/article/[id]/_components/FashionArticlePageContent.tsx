import { FashionAiSummary } from '@/app/fashion/_components/FashionAiSummary'
import { FashionArticleBody } from '@/app/fashion/article/[id]/_components/FashionArticleBody'
import { FashionArticleHeader } from '@/app/fashion/article/[id]/_components/FashionArticleHeader'
import { FashionArticleProducts } from '@/app/fashion/article/[id]/_components/FashionArticleProducts'
import { fashionConfig } from '@/app/fashion/config'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { BackToResults } from '@/components/BackToResults'

interface FashionArticlePageContentProps {
  article: FashionArticleHitValues
  products: Record<string, unknown>[]
  isProductsLoading: boolean
}

export const FashionArticlePageContent = ({
  article,
  products,
  isProductsLoading,
}: FashionArticlePageContentProps) => {
  const { slug } = fashionConfig

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <BackToResults
        fallbackHref={`/${slug}/search`}
        label="Back to collection"
      />

      <FashionArticleHeader article={article} />

      <div className="mx-auto mt-12 max-w-2xl">
        <FashionAiSummary article={article} />
      </div>

      <FashionArticleBody blocks={article.body} />

      <FashionArticleProducts
        products={products}
        isLoading={isProductsLoading}
      />
    </div>
  )
}
