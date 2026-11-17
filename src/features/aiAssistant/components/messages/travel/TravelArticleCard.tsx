'use client'

import { Clock, User } from 'lucide-react'
import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type {
  TravelDisplayItem,
  TravelArticleData,
} from '@/features/aiAssistant/types'

interface TravelArticleCardProps {
  item: TravelDisplayItem
  variant?: 'carousel' | 'grid'
  directData?: TravelArticleData
}

export const TravelArticleCard = ({
  item,
  variant = 'carousel',
  directData,
}: TravelArticleCardProps) => {
  const articleData = useCardData(directData, [
    'travelContent',
    'articles',
    item.objectID,
  ])
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  const isCarousel = variant === 'carousel'
  const widthClass = isCarousel ? 'w-64 shrink-0' : 'w-full'

  if (!articleData) {
    return (
      <div
        className={`border-border ${widthClass} animate-pulse overflow-hidden rounded-lg border`}>
        <div className="bg-card/80 h-36 w-full" />
        <div className="bg-card/80 space-y-2 p-3">
          <div className="bg-background/50 h-2.5 w-16 rounded" />
          <div className="bg-background/50 h-4 w-full rounded" />
          <div className="bg-background/50 h-3 w-full rounded" />
          <div className="bg-background/50 h-3 w-3/4 rounded" />
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/travel/article/${encodeURIComponent(item.objectID)}`}
      onClick={handleLinkClick}
      className={`bg-card/80 border-border group block ${widthClass} overflow-hidden rounded-lg border transition-shadow duration-200 hover:shadow-lg`}>
      {/* Image */}
      <div className="bg-card/80 relative h-36 w-full overflow-hidden">
        {item.why && (
          <span className="bg-primary/90 text-primary-foreground text-micro absolute top-2 left-2 z-10 max-w-[90%] truncate rounded px-2 py-1 font-medium uppercase">
            {item.why}
          </span>
        )}
        <Image
          src={articleData.image}
          alt={articleData.title}
          fill
          sizes="256px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="bg-card/80 space-y-2 p-3">
        <h4 className="text-foreground line-clamp-2 text-sm leading-tight font-semibold">
          {articleData.title}
        </h4>
        {articleData.subtitle && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {articleData.subtitle}
          </p>
        )}
        <div className="text-muted-foreground text-micro flex flex-wrap items-center gap-2 pt-1">
          {articleData.author && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {articleData.author}
            </span>
          )}
          {articleData.author && articleData.readTime && <span>•</span>}
          {articleData.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {articleData.readTime}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
