'use client'

import { Hits } from 'react-instantsearch'

import { getArticleHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import type {
  ActivityHitValues,
  ArticleHitValues,
} from '@/app/travel/hitValues.types'
import { TravelMapArticleCard } from '@/app/travel/map/_components/TravelMapArticleCard'
import { TravelMapArticleDetail } from '@/app/travel/map/_components/TravelMapArticleDetail'
import { EmptyIndexState } from '@/components/results/EmptyIndexState'
import { SearchResultsHeader } from '@/components/results/SearchResultsHeader'

interface TravelMapPanelProps {
  selectedArticle: ArticleHitValues | null
  hoveredArticleId: string | null
  hoveredActivityId: string | null
  activities: ActivityHitValues[]
  isLoadingActivities: boolean
  activitiesError: Error | null
  onSelectArticle: (id: string | null) => void
  onHoverArticle: (id: string | null) => void
  onHoverActivity: (id: string | null) => void
}

export const TravelMapPanel = ({
  selectedArticle,
  hoveredArticleId,
  hoveredActivityId,
  activities,
  isLoadingActivities,
  activitiesError,
  onSelectArticle,
  onHoverArticle,
  onHoverActivity,
}: TravelMapPanelProps) => {
  if (selectedArticle) {
    return (
      <TravelMapArticleDetail
        article={selectedArticle}
        activities={activities}
        isLoadingActivities={isLoadingActivities}
        activitiesError={activitiesError}
        hoveredActivityId={hoveredActivityId}
        onBack={() => onSelectArticle(null)}
        onHoverActivity={onHoverActivity}
      />
    )
  }

  const template = travelConfig.algolia.primaryIndex.template

  return (
    <div className="p-4">
      <SearchResultsHeader label="Explore" showResultCount />
      <EmptyIndexState message="No articles found" />
      {template && (
        <Hits
          bannerComponent={false}
          hitComponent={({ hit }) => {
            const article = getArticleHitValues(
              hit,
              template,
              travelConfig.slug,
            )
            return (
              <TravelMapArticleCard
                article={article}
                isHovered={hoveredArticleId === article.objectID}
                isSelected={false}
                onHover={onHoverArticle}
                onSelect={onSelectArticle}
              />
            )
          }}
          classNames={{
            list: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
            item: '',
          }}
        />
      )}
    </div>
  )
}
