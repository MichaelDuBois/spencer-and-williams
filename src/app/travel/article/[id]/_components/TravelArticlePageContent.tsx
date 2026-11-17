import { TravelArticleBody } from '@/app/travel/article/[id]/_components/TravelArticleBody'
import { TravelArticleHeader } from '@/app/travel/article/[id]/_components/TravelArticleHeader'
import { TravelArticleRelatedActivities } from '@/app/travel/article/[id]/_components/TravelArticleRelatedActivities'
import { travelConfig } from '@/app/travel/config'
import type {
  ActivityHitValues,
  ArticleHitValues,
} from '@/app/travel/hitValues.types'
import { BackToResults } from '@/components/BackToResults'

export const TravelArticlePageContent = ({
  article,
  relatedActivities,
  isRelatedActivitiesLoading,
}: {
  article: ArticleHitValues
  relatedActivities: ActivityHitValues[]
  isRelatedActivitiesLoading: boolean
}) => {
  const { slug } = travelConfig

  return (
    <div className="from-secondary/80 bg-linear-to-b to-transparent">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <BackToResults
          fallbackHref={`/${slug}/search`}
          label="Back to travel search"
        />
        <TravelArticleHeader article={article} />
        <TravelArticleBody
          article={article}
          relatedActivities={relatedActivities}
          isRelatedActivitiesLoading={isRelatedActivitiesLoading}
        />
        <TravelArticleRelatedActivities
          relatedActivities={relatedActivities}
          isLoading={isRelatedActivitiesLoading}
        />
      </div>
    </div>
  )
}
