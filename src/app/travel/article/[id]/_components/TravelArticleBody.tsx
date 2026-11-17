import { TravelArticleFeature } from '@/app/travel/article/[id]/_components/TravelArticleFeature'
import { TravelArticleMap } from '@/app/travel/article/[id]/_components/TravelArticleMap'
import type {
  ActivityHitValues,
  ArticleHitValues,
} from '@/app/travel/hitValues.types'
import { cn } from '@/lib/utils'

interface TravelArticleBodyProps {
  article: ArticleHitValues
  relatedActivities: ActivityHitValues[]
  isRelatedActivitiesLoading: boolean
}

export const TravelArticleBody = ({
  article,
  relatedActivities,
  isRelatedActivitiesLoading,
}: TravelArticleBodyProps) => {
  const body = article.body ?? []
  const introParagraphCount = body.length > 4 ? 3 : Math.min(2, body.length)
  const openingParagraphs = body.slice(0, introParagraphCount)
  const remainingParagraphs = body.slice(introParagraphCount)
  const featureQuote = article.keyQuotes?.[0]

  return (
    <section className="mx-auto mt-14 max-w-4xl">
      <div className="space-y-6">
        <TravelArticleMap
          article={article}
          activities={relatedActivities}
          isLoading={isRelatedActivitiesLoading}
        />
        {openingParagraphs.map((paragraph, index) => (
          <p
            key={`${article.objectID}-opening-${index}`}
            className={cn(
              'text-foreground/90 text-[length:var(--article-body-font-size)] leading-8 md:leading-9',
              index === 0 &&
                'first-letter:text-accent first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-serif first-letter:text-[4.75rem] first-letter:leading-[0.8]',
            )}>
            {paragraph}
          </p>
        ))}
      </div>

      {featureQuote && (
        <TravelArticleFeature
          image={article.image}
          title={article.title}
          quote={featureQuote}
        />
      )}

      <div className="space-y-6">
        {remainingParagraphs.map((paragraph, index) => (
          <p
            key={`${article.objectID}-remaining-${index}`}
            className="text-foreground/90 text-[length:var(--article-body-font-size)] leading-8 md:leading-9">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
