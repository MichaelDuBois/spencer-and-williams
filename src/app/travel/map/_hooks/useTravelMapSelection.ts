'use client'

import { useCallback, useMemo, useState } from 'react'

import { useRelatedActivities } from '@/app/travel/_hooks/useRelatedActivities'
import type {
  ActivityHitValues,
  ArticleHitValues,
} from '@/app/travel/hitValues.types'

interface UseTravelMapSelectionReturn {
  selectedArticleId: string | null
  hoveredArticleId: string | null
  hoveredActivityId: string | null
  selectedArticle: ArticleHitValues | null
  activities: ActivityHitValues[]
  isLoadingActivities: boolean
  activitiesError: Error | null
  selectArticle: (id: string | null) => void
  hoverArticle: (id: string | null) => void
  hoverActivity: (id: string | null) => void
}

export const useTravelMapSelection = (
  articles: ArticleHitValues[],
): UseTravelMapSelectionReturn => {
  const [requestedArticleId, setRequestedArticleId] = useState<string | null>(
    null,
  )
  const [hoveredArticleId, setHoveredArticleId] = useState<string | null>(null)
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(
    null,
  )

  const selectedArticle = useMemo(
    () => articles.find((a) => a.objectID === requestedArticleId) ?? null,
    [articles, requestedArticleId],
  )
  const selectedArticleId = selectedArticle?.objectID ?? null

  const relatedActivityIds = selectedArticle?.relatedActivities ?? []
  const {
    data: activities = [],
    isLoading,
    error,
  } = useRelatedActivities(relatedActivityIds)

  const selectArticle = useCallback(
    (id: string | null) => setRequestedArticleId(id),
    [],
  )
  const hoverArticle = useCallback(
    (id: string | null) => setHoveredArticleId(id),
    [],
  )
  const hoverActivity = useCallback(
    (id: string | null) => setHoveredActivityId(id),
    [],
  )

  return {
    selectedArticleId,
    hoveredArticleId,
    hoveredActivityId,
    selectedArticle,
    activities,
    isLoadingActivities: isLoading,
    activitiesError: (error as Error) ?? null,
    selectArticle,
    hoverArticle,
    hoverActivity,
  }
}
