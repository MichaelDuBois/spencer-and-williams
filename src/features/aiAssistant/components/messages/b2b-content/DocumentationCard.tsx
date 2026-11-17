'use client'

import Link from 'next/link'

import { getDocumentationTypeIcon } from '@/app/b2b-content/_utils/getDocumentationTypeIcon'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type {
  B2BContentDisplayItem,
  B2BContentDocumentationData,
} from '@/features/aiAssistant/types'

interface DocumentationCardProps {
  item: B2BContentDisplayItem
  variant?: 'carousel' | 'grid'
  directData?: B2BContentDocumentationData
}

export const DocumentationCard = ({
  item,
  variant = 'carousel',
  directData,
}: DocumentationCardProps) => {
  const docData = useCardData(directData, [
    'b2bContent',
    'documentation',
    item.objectID,
  ])
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  const isCarousel = variant === 'carousel'
  const widthClass = isCarousel ? 'w-64 shrink-0' : 'w-full'

  if (!docData) {
    return (
      <div
        className={`border-border ${widthClass} animate-pulse rounded-lg border p-3`}>
        <div className="flex gap-3">
          <div className="bg-card/80 h-10 w-10 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="bg-background/50 h-3 w-12 rounded" />
            <div className="bg-background/50 h-4 w-full rounded" />
            <div className="bg-background/50 h-3 w-3/4 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={docData.productUrl}
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
          {getDocumentationTypeIcon(docData.docType, { className: 'h-5 w-5' })}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          {docData.docType && (
            <span className="text-accent text-micro font-semibold tracking-wider uppercase">
              {docData.docType}
            </span>
          )}
          <h4 className="text-foreground line-clamp-2 text-sm leading-tight font-semibold">
            {docData.title}
          </h4>
          {docData.description && (
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
              {docData.description}
            </p>
          )}
          {docData.category && (
            <p className="text-muted-foreground text-micro truncate font-bold tracking-wide uppercase">
              {docData.category}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
