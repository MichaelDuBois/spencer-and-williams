import { CalendarDays, Clock3, MapPin, Wallet } from 'lucide-react'

import {
  TravelStatsPanel,
  type TravelStatItem,
} from '@/app/travel/_components/TravelStatsPanel'
import {
  formatBudget,
  formatDisplayLabel,
} from '@/app/travel/_utils/travelContentFormatters'
import type { ArticleHitValues } from '@/app/travel/hitValues.types'

export const TravelArticleStatsPanel = ({
  article,
}: {
  article: ArticleHitValues
}) => {
  const bestSeasonLabel = article.season?.length
    ? article.season.map(formatDisplayLabel).join(', ')
    : 'Any time of year'
  const items: TravelStatItem[] = [
    {
      icon: CalendarDays,
      heading: 'Best season',
      value: bestSeasonLabel,
    },
    {
      icon: Wallet,
      heading: 'Budget',
      value: formatBudget(article.budget ?? ''),
    },
    {
      icon: Clock3,
      heading: 'Recommended stay',
      value:
        article.recommendedDurationDays !== undefined
          ? `${article.recommendedDurationDays} day${
              article.recommendedDurationDays === 1 ? '' : 's'
            }`
          : 'Flexible',
    },
    {
      icon: MapPin,
      heading: 'Location',
      value: article.location || 'Destination to be confirmed',
    },
  ]

  return <TravelStatsPanel items={items} />
}
