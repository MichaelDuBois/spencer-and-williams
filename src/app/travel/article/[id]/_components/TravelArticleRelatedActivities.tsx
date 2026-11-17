import { formatLocation } from '@/app/travel/_utils/travelContentFormatters'
import type { ActivityHitValues } from '@/app/travel/hitValues.types'
import { Image } from '@/components/image/Image'
import { cn } from '@/lib/utils'

const MAX_RELATED_ACTIVITIES = 4

const RelatedActivityCard = ({
  activity,
  featured = false,
  className,
}: {
  activity: ActivityHitValues
  featured?: boolean
  className?: string
}) => {
  const title = activity.title
  const description = activity.subtitle || activity.description || null
  const location = formatLocation(activity.location, activity.country)
  const image = activity.image

  const content = (
    <>
      <Image
        src={image}
        alt={title}
        fill
        sizes={featured ? '(max-width: 1024px) 100vw, 42vw' : '33vw'}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="from-primary/90 via-primary/35 absolute inset-0 bg-linear-to-t to-transparent" />

      <div className="text-primary-foreground absolute inset-x-0 bottom-0 p-5">
        <p className="text-primary-foreground/70 text-xs tracking-widest uppercase">
          {location}
        </p>
        <h3
          className={cn(
            'mt-2 leading-tight font-medium',
            featured ? 'text-2xl md:text-3xl' : 'text-lg',
          )}>
          {title}
        </h3>
        {description && featured && (
          <p
            className={cn(
              'text-primary-foreground/80 mt-2 text-sm leading-relaxed',
              featured ? 'line-clamp-3 max-w-xl' : 'line-clamp-2',
            )}>
            {description}
          </p>
        )}
      </div>
    </>
  )

  const classes = cn(
    'group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/10',
    featured ? 'aspect-square min-h-80' : 'h-full min-h-40',
    className,
  )

  return <article className={classes}>{content}</article>
}

export const TravelArticleRelatedActivities = ({
  relatedActivities,
  isLoading,
}: {
  relatedActivities: ActivityHitValues[]
  isLoading: boolean
}) => {
  const displayedActivities = relatedActivities.slice(0, MAX_RELATED_ACTIVITIES)
  const relatedFeature = displayedActivities[0]
  const relatedStack = displayedActivities.slice(1)

  return (
    <section className="border-border mx-auto mt-16 max-w-6xl border-t pt-12">
      <div className="max-w-3xl">
        <p className="text-accent text-xs font-medium tracking-widest uppercase">
          Continue exploring
        </p>
        <h2 className="text-foreground mt-4 text-3xl font-light tracking-tight md:text-4xl">
          Related activities
        </h2>
        <p className="text-muted-foreground mt-3 text-base leading-7">
          More ways to build out the same trip, from signature highlights to
          smaller off-route discoveries.
        </p>
      </div>

      {isLoading && (
        <div className="mt-8 grid gap-4 xl:grid-cols-5">
          <div className="bg-muted aspect-square animate-pulse rounded-2xl xl:col-span-3" />
          <div className="grid gap-4 xl:col-span-2 xl:grid-rows-3">
            <div className="bg-muted h-40 animate-pulse rounded-2xl xl:h-full" />
            <div className="bg-muted h-40 animate-pulse rounded-2xl xl:h-full" />
            <div className="bg-muted h-40 animate-pulse rounded-2xl xl:h-full" />
          </div>
        </div>
      )}

      {!isLoading && relatedFeature && (
        <div className="mt-8 grid gap-4 xl:grid-cols-5">
          <RelatedActivityCard
            activity={relatedFeature}
            featured
            className="xl:col-span-3"
          />

          <div className="grid gap-4 sm:grid-cols-1 xl:col-span-2 xl:grid-cols-1 xl:grid-rows-3">
            {relatedStack.map((activity) => (
              <RelatedActivityCard
                key={activity.objectID}
                activity={activity}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
