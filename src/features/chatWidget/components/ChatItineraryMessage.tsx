'use client'

import { ChevronRight, Clock, Info, MapPin } from 'lucide-react'
import Link from 'next/link'

import { getRelatedActivityHref } from '@/app/travel/_utils/travelActivityNavigation'
import { Image } from '@/components/image/Image'
import type {
  ItineraryActivity,
  ItineraryData,
} from '@/features/chatWidget/types/itinerary.types'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { cn } from '@/lib/utils'

interface ChatItineraryMessageProps {
  data: ItineraryData
  onLinkClick?: () => void
  isStreaming?: boolean
}

/**
 * Renders `displayItinerary` tool output as day-by-day cards. Activities with
 * a `parentID` link to their parent record's page (article or podcast);
 * freeform activities render as plain text. Sourced activities may carry an
 * image thumbnail and a location line. Also used for streaming previews of
 * partial tool input, which may be missing a destination.
 */
export const ChatItineraryMessage = ({
  data,
  onLinkClick,
  isStreaming = false,
}: ChatItineraryMessageProps) => {
  const config = useActiveConfig()
  const title =
    data.title ??
    (data.destination ? `${data.destination} itinerary` : 'Your itinerary')

  return (
    <div className="space-y-3">
      <div className="bg-muted rounded-card p-1">
        <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
          <MapPin className="text-accent h-4 w-4 shrink-0" aria-hidden />
          {title}
        </p>
        {data.destination && data.durationNights !== undefined && (
          <p className="text-muted-foreground mt-0.5 pl-1 text-xs">
            {data.durationNights} night{data.durationNights === 1 ? '' : 's'} in{' '}
            {data.destination}
          </p>
        )}
      </div>

      <ol className="sw-ItineraryDays space-y-2">
        {data.days.map((day, index) => (
          <li
            key={`${day.day}-${index}`}
            className="border-border rounded-card border p-3">
            <h4 className="text-foreground text-sm font-semibold">
              Day {day.day} · {day.title}
            </h4>
            <ul className="sw-ItineraryActivities mt-2 space-y-2.5">
              {day.activities.map((activity, activityIndex) => (
                <ItineraryActivityRow
                  key={
                    activity.objectID
                      ? `${activity.objectID}-${activityIndex}`
                      : `activity-${activityIndex}`
                  }
                  activity={activity}
                  slug={config?.slug}
                  onLinkClick={onLinkClick}
                  isStreaming={isStreaming}
                />
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {data.notes && (
        <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {data.notes}
        </p>
      )}
    </div>
  )
}

interface ItineraryActivityRowProps {
  activity: ItineraryActivity
  slug?: string
  onLinkClick?: () => void
  isStreaming: boolean
}

const ItineraryActivityRow = ({
  activity,
  slug,
  onLinkClick,
  isStreaming,
}: ItineraryActivityRowProps) => {
  // Activities surface through their parent record's page (same pattern as
  // TravelActivityCard; there is no /activity route). The shared helper routes
  // article- and podcast-prefixed parentIDs; anything else does not link.
  const href =
    !isStreaming && slug && activity.parentID
      ? getRelatedActivityHref(activity.parentID, slug)
      : undefined
  const nameClassName = cn('text-sm font-medium', !href && 'text-foreground')

  return (
    <li>
      <div className="flex items-start gap-2.5">
        {activity.image && (
          <div className="bg-muted rounded-card relative h-16 w-16 shrink-0 overflow-hidden">
            <Image
              src={activity.image}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            {activity.time && (
              <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full py-0.5 text-xs">
                <Clock className="h-3 w-3" aria-hidden />
                {activity.time}
              </span>
            )}
            {href ? (
              <Link
                href={href}
                onClick={onLinkClick}
                className={cn(
                  nameClassName,
                  'text-accent focus-visible:outline-accent inline-flex items-center gap-0.5 rounded-sm hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2',
                )}>
                {activity.name}
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </Link>
            ) : (
              <span className={nameClassName}>{activity.name}</span>
            )}
          </div>
          {activity.location && (
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              {activity.location}
            </p>
          )}
          {activity.description && (
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {activity.description}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}
