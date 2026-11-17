import { TravelAiSummary } from '@/app/travel/_components/TravelAiSummary'
import { formatDisplayLabel } from '@/app/travel/_utils/travelContentFormatters'
import { TravelArticleStatsPanel } from '@/app/travel/article/[id]/_components/TravelArticleStatsPanel'
import { TravelArticleTags } from '@/app/travel/article/[id]/_components/TravelArticleTags'
import { TravelArticleTitleBlock } from '@/app/travel/article/[id]/_components/TravelArticleTitleBlock'
import type { ArticleHitValues } from '@/app/travel/hitValues.types'

export const TravelArticleHeader = ({
  article,
}: {
  article: ArticleHitValues
}) => {
  const destinationLabel = article.destinationType?.length
    ? article.destinationType.slice(0, 3).map(formatDisplayLabel).join(' / ')
    : 'Travel Guide'

  return (
    <header className="mx-auto max-w-6xl">
      <p className="text-accent text-xs font-medium tracking-[0.35em] uppercase">
        {destinationLabel}
      </p>
      <TravelArticleTitleBlock
        title={article.title}
        subtitle={article.subtitle}
        author={article.author}
        date={article.date}
        readTime={article.readTime}
      />
      {article.tags && <TravelArticleTags tags={article.tags} />}

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(14.5rem,15.5rem)_minmax(0,1fr)] lg:items-start">
        <TravelArticleStatsPanel article={article} />
        <TravelAiSummary article={article} />
      </div>
    </header>
  )
}
