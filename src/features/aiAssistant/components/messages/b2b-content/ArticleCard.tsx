'use client'

import { ChevronRight, Clock, LifeBuoy, Pin } from 'lucide-react'
import Link from 'next/link'

import { OutdatedBadge } from '@/components/badge/OutdatedBadge'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type {
  B2BContentArticleData,
  B2BContentDisplayItem,
} from '@/features/aiAssistant/types'

interface ArticleCardProps {
  item: B2BContentDisplayItem
  variant?: 'carousel' | 'grid'
  directData?: B2BContentArticleData
}

export const ArticleCard = ({
  item,
  variant = 'carousel',
  directData,
}: ArticleCardProps) => {
  const articleData = useCardData(directData, [
    'b2bContent',
    'articles',
    item.objectID,
  ])
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  const isCarousel = variant === 'carousel'
  const widthClass = isCarousel ? 'w-64 shrink-0' : 'w-full'

  if (!articleData) {
    return (
      <div
        className={`border-border ${widthClass} animate-pulse rounded-lg border p-3`}>
        <div className="flex gap-3">
          <div className="bg-card/80 h-10 w-10 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="bg-background/50 h-4 w-full rounded" />
            <div className="bg-background/50 h-3 w-3/4 rounded" />
            <div className="bg-background/50 h-3 w-1/2 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={articleData.productUrl}
      onClick={handleLinkClick}
      className={`bg-card/80 border-border hover:bg-card/60 group block ${widthClass} overflow-hidden rounded-lg border p-3 transition-shadow duration-200 hover:shadow-lg`}>
      {item.why && (
        <span className="bg-primary/90 text-primary-foreground text-micro mb-2 inline-block max-w-full truncate rounded px-2 py-0.5 font-medium uppercase">
          {item.why}
        </span>
      )}
      <div className="flex gap-3">
        <div
          className="bg-accent/10 text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          aria-hidden="true">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start gap-1">
            <h4 className="text-foreground line-clamp-2 flex-1 text-sm leading-tight font-semibold">
              {articleData.title}
            </h4>
            {articleData.promoted && (
              <Pin
                className="text-accent mt-0.5 h-3 w-3 shrink-0"
                aria-label="Promoted"
              />
            )}
          </div>
          {articleData.outdated && <OutdatedBadge size="compact" />}
          {(articleData.category || articleData.section) && (
            <p className="text-muted-foreground text-micro flex flex-wrap items-center gap-1 font-bold tracking-wide uppercase">
              {articleData.category && (
                <span className="truncate">{articleData.category}</span>
              )}
              {articleData.category && articleData.section && (
                <ChevronRight className="h-3 w-3 shrink-0" />
              )}
              {articleData.section && (
                <span className="truncate">{articleData.section}</span>
              )}
            </p>
          )}
          {articleData.updatedAt && (
            <p className="text-muted-foreground text-micro flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {articleData.updatedAt}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
