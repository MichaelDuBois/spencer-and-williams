'use client'

import { Clock, User } from 'lucide-react'
import Link from 'next/link'

import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { Image } from '@/components/image/Image'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import type { VerticalDisplayItem } from '@/features/aiAssistant/types'
import { cn } from '@/lib/utils'

interface FashionArticleCardProps {
  item: VerticalDisplayItem
  directData?: FashionArticleHitValues
}

export const FashionArticleCard = ({
  item,
  directData,
}: FashionArticleCardProps) => {
  const articleData = directData
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  if (!articleData) {
    return (
      <div
        className={cn(
          'border-border bg-card/80 w-64 shrink-0 animate-pulse overflow-hidden rounded-lg border',
        )}>
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
      href={`/fashion/article/${encodeURIComponent(item.objectID)}`}
      onClick={handleLinkClick}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'border-border bg-card/80 group block w-64 shrink-0 overflow-hidden rounded-lg border transition-shadow duration-200 hover:shadow-lg',
      )}>
      {/* Image */}
      <div className="bg-card/80 relative h-36 w-full overflow-hidden">
        <Image
          src={articleData.image ?? articleData.thumbnail}
          alt={articleData.title}
          fill
          sizes="256px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="bg-card/80 space-y-2 p-3">
        {articleData.category && (
          <p className="text-accent text-micro font-medium tracking-widest uppercase">
            {articleData.category}
          </p>
        )}
        <h4 className="text-foreground line-clamp-2 text-sm leading-tight font-semibold">
          {articleData.title}
        </h4>
        {articleData.subtitle && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {articleData.subtitle}
          </p>
        )}
        <div className="text-muted-foreground text-micro flex flex-wrap items-center gap-2 pt-1">
          {articleData.author?.name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {articleData.author.name}
            </span>
          )}
          {articleData.author?.name &&
            typeof articleData.readingTime === 'number' &&
            articleData.readingTime > 0 && <span>•</span>}
          {typeof articleData.readingTime === 'number' &&
            articleData.readingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {articleData.readingTime} min read
              </span>
            )}
        </div>
      </div>
    </Link>
  )
}
