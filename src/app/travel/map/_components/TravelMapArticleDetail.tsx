'use client'

import { ArrowLeft, MapPinOff } from 'lucide-react'
import Link from 'next/link'

import { travelConfig } from '@/app/travel/config'
import type {
  ActivityHitValues,
  ArticleHitValues,
} from '@/app/travel/hitValues.types'
import { Image } from '@/components/image/Image'
import { trackContentClick } from '@/lib/analytics/content-events'
import { cn } from '@/lib/utils'

interface TravelMapArticleDetailProps {
  article: ArticleHitValues
  activities: ActivityHitValues[]
  isLoadingActivities: boolean
  activitiesError: Error | null
  hoveredActivityId: string | null
  onBack: () => void
  onHoverActivity: (id: string | null) => void
}

const ActivitySkeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="bg-muted aspect-4/3 w-full rounded-md" />
    <div className="bg-muted h-3 w-3/4 rounded" />
    <div className="bg-muted h-3 w-1/2 rounded" />
  </div>
)

export const TravelMapArticleDetail = ({
  article,
  activities,
  isLoadingActivities,
  activitiesError,
  hoveredActivityId,
  onBack,
  onHoverActivity,
}: TravelMapArticleDetailProps) => (
  <div className="flex flex-col gap-4 p-4">
    <button
      type="button"
      onClick={onBack}
      className="text-accent group flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium">
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      Back to results
    </button>

    <Link
      href={article.productUrl}
      className="group block"
      onClick={() =>
        trackContentClick(article, {
          contentType: 'article',
          index: travelConfig.algolia.primaryIndex.name,
        })
      }>
      <div className="bg-muted rounded-image relative aspect-4/3 w-full overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <h2 className="text-foreground mt-3 text-lg leading-tight font-bold">
        {article.title}
      </h2>
      {article.location && (
        <p className="text-muted-foreground mt-1 text-sm">{article.location}</p>
      )}
    </Link>

    {article.aiSummary && (
      <p className="text-foreground/80 text-sm leading-relaxed">
        {article.aiSummary}
      </p>
    )}

    <div>
      <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
        Nearby activities
      </h3>

      {isLoadingActivities && (
        <div className="grid grid-cols-2 gap-3">
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
        </div>
      )}

      {activitiesError && (
        <p className="text-muted-foreground text-xs">
          Couldn&apos;t load nearby activities.
        </p>
      )}

      {!isLoadingActivities && !activitiesError && activities.length === 0 && (
        <p className="text-muted-foreground text-xs">
          No nearby activities for this article.
        </p>
      )}

      {!isLoadingActivities && !activitiesError && activities.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {activities.map((activity) => (
            <li
              key={activity.objectID}
              onMouseEnter={() => onHoverActivity(activity.objectID)}
              onMouseLeave={() => onHoverActivity(null)}
              className={cn(
                'flex flex-col gap-2 rounded-md p-2 transition-colors',
                hoveredActivityId === activity.objectID && 'bg-muted',
              )}>
              <div className="bg-muted relative aspect-4/3 w-full overflow-hidden rounded-md">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-foreground line-clamp-2 text-sm leading-tight font-medium">
                  {activity.title}
                </div>
                {activity.location && (
                  <div className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                    {activity.location}
                  </div>
                )}
                {!activity._geoloc && (
                  <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <MapPinOff className="h-3 w-3" />
                    No location
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)
