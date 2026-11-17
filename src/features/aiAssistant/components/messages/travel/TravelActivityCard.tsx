'use client'

import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type {
  TravelDisplayItem,
  TravelActivityData,
} from '@/features/aiAssistant/types'

interface TravelActivityCardProps {
  item: TravelDisplayItem
  directData?: TravelActivityData
}

export const TravelActivityCard = ({
  item,
  directData,
}: TravelActivityCardProps) => {
  const activityData = useCardData(directData, [
    'travelContent',
    'activities',
    item.objectID,
  ])
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  if (!activityData) {
    return (
      <div className="rounded-card bg-muted h-52 w-64 shrink-0 animate-pulse overflow-hidden" />
    )
  }

  return (
    <Link
      href={`/travel/article/${encodeURIComponent(String(activityData.parentID))}`}
      onClick={handleLinkClick}
      className="group rounded-card relative block h-52 w-64 shrink-0 overflow-hidden">
      {/* Full-bleed background image */}
      <Image
        src={activityData.image}
        alt={activityData.title}
        fill
        sizes="256px"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        {/* Location subtitle */}
        {activityData.location && (
          <p className="mb-1 text-xs font-medium tracking-wide text-white/80 uppercase">
            {activityData.location}
          </p>
        )}

        {/* Title */}
        <h4 className="line-clamp-2 text-base leading-snug font-semibold text-white">
          {activityData.title}
        </h4>
      </div>
    </Link>
  )
}
