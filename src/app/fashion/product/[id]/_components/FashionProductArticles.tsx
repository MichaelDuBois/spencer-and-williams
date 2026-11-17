'use client'

import { useMemo } from 'react'

import { JournalCard } from '@/app/fashion/_components/JournalCard'
import { useFashionArticles } from '@/app/fashion/_hooks/useFashionArticles'
import { getRelatedProductsFilter } from '@/app/fashion/_utils/getRelatedProductsFilter'
import { useSetProductContext } from '@/features/aiAssistant/hooks/useSetProductContext'
import { relatedArticlesContextState } from '@/features/aiAssistant/stores/aiAssistant'

const ARTICLE_COUNT = 3

const IMAGE_SIZES = '320px'

// Fixed 20rem tracks rather than three fluid columns, so one or two matches
// stay centred under the heading instead of hanging off the left edge.
const GRID_CLASSES =
  'mt-10 grid grid-cols-1 justify-center gap-8 sm:grid-cols-[repeat(auto-fit,minmax(0,20rem))]'

const LoadingSkeleton = () => (
  <div className={GRID_CLASSES}>
    {Array.from({ length: ARTICLE_COUNT }).map((_, index) => (
      <div
        key={index}
        className="mx-auto w-full max-w-xs space-y-4 md:max-w-none">
        <div className="bg-muted rounded-image aspect-3/4 w-full animate-pulse" />
        <div className="bg-muted h-3 w-1/3 animate-pulse" />
        <div className="bg-muted h-4 w-3/4 animate-pulse" />
      </div>
    ))}
  </div>
)

interface FashionProductArticlesProps {
  objectID: string
}

export const FashionProductArticles = ({
  objectID,
}: FashionProductArticlesProps) => {
  const filters = getRelatedProductsFilter(objectID)
  const { articles, isLoading } = useFashionArticles({
    key: 'product-articles',
    count: ARTICLE_COUNT,
    filters,
    enabled: !!filters,
  })

  // Only what the assistant needs to recommend a read — not the whole record.
  const articlesContext = useMemo(() => {
    if (articles.length === 0) return null

    return articles.map((article) => {
      return {
        objectID: article.objectID,
        title: article.title,
        url: article.productUrl,
        category: article.category,
        readingTime: article.readingTime,
      }
    })
  }, [articles])

  useSetProductContext(relatedArticlesContextState, articlesContext)

  if (!isLoading && articles.length === 0) return null

  return (
    <section className="border-border mt-20 border-t pt-16">
      <div className="text-center">
        <h2 className="font-secondary text-2xl tracking-[0.15em] uppercase">
          Featured In The Journal
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-md text-sm leading-relaxed">
          Editorials and styling guides featuring this piece.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className={GRID_CLASSES}>
          {articles.map((article) => (
            <JournalCard
              key={article.objectID}
              article={article}
              imageSizes={IMAGE_SIZES}
            />
          ))}
        </div>
      )}
    </section>
  )
}
