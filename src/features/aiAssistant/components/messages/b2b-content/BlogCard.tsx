'use client'

import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type {
  B2BContentBlogData,
  B2BContentDisplayItem,
} from '@/features/aiAssistant/types'

interface BlogCardProps {
  item: B2BContentDisplayItem
  variant?: 'carousel' | 'grid'
  directData?: B2BContentBlogData
}

export const BlogCard = ({
  item,
  variant = 'carousel',
  directData,
}: BlogCardProps) => {
  const blogData = useCardData(directData, [
    'b2bContent',
    'blogs',
    item.objectID,
  ])
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  const isCarousel = variant === 'carousel'
  const widthClass = isCarousel ? 'w-64 shrink-0' : 'w-full'

  if (!blogData) {
    return (
      <div
        className={`border-border ${widthClass} animate-pulse overflow-hidden rounded-lg border`}>
        <div className="bg-card/80 h-32 w-full" />
        <div className="bg-card/80 space-y-2 p-3">
          <div className="bg-background/50 h-2.5 w-16 rounded" />
          <div className="bg-background/50 h-4 w-full rounded" />
          <div className="bg-background/50 h-3 w-3/4 rounded" />
        </div>
      </div>
    )
  }

  return (
    <Link
      href={blogData.productUrl}
      onClick={handleLinkClick}
      className={`bg-card/80 border-border group block ${widthClass} overflow-hidden rounded-lg border transition-shadow duration-200 hover:shadow-lg`}>
      <div className="bg-card/80 relative h-32 w-full overflow-hidden">
        {item.why && (
          <span className="bg-primary/90 text-primary-foreground text-micro absolute top-2 left-2 z-10 max-w-[90%] truncate rounded px-2 py-1 font-medium uppercase">
            {item.why}
          </span>
        )}
        <Image
          src={blogData.image}
          alt={blogData.title}
          fill
          sizes="256px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {blogData.image && (
          <div
            className="bg-accent/80 absolute inset-0 mix-blend-color"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="bg-card/80 space-y-2 p-3">
        {blogData.category && (
          <p className="text-accent text-micro font-semibold tracking-wider uppercase">
            {blogData.category}
          </p>
        )}
        <h4 className="text-foreground line-clamp-2 text-sm leading-tight font-semibold">
          {blogData.title}
        </h4>
        {blogData.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {blogData.description}
          </p>
        )}
        <div className="text-muted-foreground text-micro flex flex-wrap items-center gap-2 pt-1">
          {blogData.authorDisplay && (
            <span className="truncate font-medium">
              {blogData.authorDisplay}
            </span>
          )}
          {blogData.authorDisplay && blogData.publishedAt && <span>•</span>}
          {blogData.publishedAt && <span>{blogData.publishedAt}</span>}
        </div>
      </div>
    </Link>
  )
}
