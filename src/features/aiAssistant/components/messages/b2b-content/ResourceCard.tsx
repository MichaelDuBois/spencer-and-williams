'use client'

import { Layers } from 'lucide-react'
import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type {
  B2BContentDisplayItem,
  B2BContentResourceData,
} from '@/features/aiAssistant/types'

interface ResourceCardProps {
  item: B2BContentDisplayItem
  variant?: 'carousel' | 'grid'
  directData?: B2BContentResourceData
}

export const ResourceCard = ({
  item,
  variant = 'carousel',
  directData,
}: ResourceCardProps) => {
  const resourceData = useCardData(directData, [
    'b2bContent',
    'resources',
    item.objectID,
  ])
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  const isCarousel = variant === 'carousel'
  const widthClass = isCarousel ? 'w-64 shrink-0' : 'w-full'

  if (!resourceData) {
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

  const tags = resourceData.relatedProducts ?? []

  return (
    <Link
      href={resourceData.productUrl}
      onClick={handleLinkClick}
      className={`bg-card/80 border-border group block ${widthClass} overflow-hidden rounded-lg border transition-shadow duration-200 hover:shadow-lg`}>
      <div className="bg-card/80 relative h-32 w-full overflow-hidden">
        {item.why && (
          <span className="bg-primary/90 text-primary-foreground text-micro absolute top-2 left-2 z-10 max-w-[90%] truncate rounded px-2 py-1 font-medium uppercase">
            {item.why}
          </span>
        )}
        <Image
          src={resourceData.image}
          alt={resourceData.title}
          fill
          sizes="256px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {resourceData.image && (
          <div
            className="bg-accent/80 absolute inset-0 mix-blend-color"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="bg-card/80 space-y-2 p-3">
        {resourceData.docType && (
          <p className="text-accent text-micro font-semibold tracking-wider uppercase">
            {resourceData.docType}
          </p>
        )}
        <h4 className="text-foreground line-clamp-2 text-sm leading-tight font-semibold">
          {resourceData.title}
        </h4>
        {tags.length > 0 && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-1 pt-1">
            <Layers className="h-3 w-3 shrink-0" />
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="border-border rounded-badge text-micro truncate border px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
