'use client'

import { Headphones, Play, Clock } from 'lucide-react'
import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type {
  TravelDisplayItem,
  TravelPodcastData,
} from '@/features/aiAssistant/types'
import { cn } from '@/lib/utils'

interface TravelPodcastCardProps {
  item: TravelDisplayItem
  isExpanded?: boolean
  directData?: TravelPodcastData
}

export const TravelPodcastCard = ({
  item,
  isExpanded = false,
  directData,
}: TravelPodcastCardProps) => {
  const podcastData = useCardData(directData, [
    'travelContent',
    'podcasts',
    item.objectID,
  ])
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  if (!podcastData) {
    return (
      <div
        className={cn(
          'border-border shrink-0 animate-pulse overflow-hidden rounded-lg border',
          isExpanded ? 'w-96' : 'w-76',
        )}>
        <div className="flex gap-4 p-4">
          <div className="bg-card h-24 w-24 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="bg-background/50 h-3 w-16 rounded" />
            <div className="bg-background/50 h-3 w-12 rounded" />
            <div className="bg-background/50 h-4 w-full rounded" />
          </div>
        </div>
        <div className="space-y-2 px-4 pb-4">
          <div className="bg-background/50 h-3 w-full rounded" />
          <div className="bg-background/50 h-3 w-3/4 rounded" />
          <div className="bg-background/50 h-3 w-24 rounded" />
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/travel/podcast/${encodeURIComponent(item.objectID)}`}
      onClick={handleLinkClick}
      className={cn(
        'border-border bg-card/80 hover:bg-card/60 group block shrink-0 overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-lg',
        isExpanded ? 'w-96' : 'w-76',
      )}>
      {/* Top section: Image + Episode/Title */}
      <div className="flex gap-4 p-4 pb-3">
        {/* Podcast Cover */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={podcastData.image}
            alt={podcastData.title}
            fill
            sizes="96px"
            className="object-cover"
            fallback={
              <div className="bg-accent/10 flex h-full items-center justify-center">
                <Headphones className="text-accent/60 h-8 w-8" />
              </div>
            }
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Play
                className="text-foreground ml-0.5 h-5 w-5"
                fill="currentColor"
              />
            </div>
          </div>
        </div>

        {/* Episode number and Title */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Episode label and number on one line */}
          {podcastData.episodeNumber && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-accent line-clamp-2 text-xs font-medium tracking-wider uppercase">
                Episode {podcastData.episodeNumber} - {podcastData.title}
              </span>
            </div>
          )}

          <h4 className="text-foreground line-clamp-2 text-sm leading-tight font-semibold">
            {podcastData.episode}
          </h4>

          {/* Why tag */}
          {item.why && (
            <span className="bg-primary/10 text-primary text-micro inline-block truncate rounded px-1.5 py-0.5 font-medium">
              {item.why}
            </span>
          )}
        </div>
      </div>

      {/* Bottom section: Description and meta */}
      <div className="space-y-2 px-4 pb-4">
        {podcastData.summary && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {podcastData.summary}
          </p>
        )}
        <div className="text-muted-foreground text-micro flex flex-wrap items-center gap-2">
          {podcastData.hosts && (
            <span className="truncate">{podcastData.hosts.join(', ')}</span>
          )}
          {podcastData.hosts && podcastData.duration && <span>•</span>}
          {podcastData.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {podcastData.duration}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
