'use client'

import { useEffect, useMemo } from 'react'
import { useHits } from 'react-instantsearch'

import { getArticleHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import { TravelMap } from '@/app/travel/map/_components/TravelMap'
import { TravelMapPanel } from '@/app/travel/map/_components/TravelMapPanel'
import { useTravelMapSelection } from '@/app/travel/map/_hooks/useTravelMapSelection'
import { GeoSearchConfigure } from '@/components/storeLocator/GeoSearchConfigure'
import { useGeoSearch } from '@/hooks/useGeoSearch'

import type { BaseHit } from 'instantsearch.js'

export const TravelMapPage = () => {
  const template = travelConfig.algolia.primaryIndex.template
  const { items } = useHits<BaseHit>()
  const { setBoundingBoxSearch, clearGeoSearch } = useGeoSearch()

  useEffect(() => {
    clearGeoSearch()
  }, [clearGeoSearch])

  const articles = useMemo(
    () =>
      template
        ? items.map((hit) =>
            getArticleHitValues(hit, template, travelConfig.slug),
          )
        : [],
    [items, template],
  )

  const {
    selectedArticleId,
    hoveredArticleId,
    hoveredActivityId,
    selectedArticle,
    activities,
    isLoadingActivities,
    activitiesError,
    selectArticle,
    hoverArticle,
    hoverActivity,
  } = useTravelMapSelection(articles)

  return (
    <>
      <GeoSearchConfigure />
      <div className="flex flex-col md:grid md:h-[calc(100vh-var(--header-height,4rem))] md:grid-cols-[40%_60%]">
        <aside className="border-border md:order-1 md:overflow-y-auto md:border-r">
          <TravelMapPanel
            selectedArticle={selectedArticle}
            hoveredArticleId={hoveredArticleId}
            hoveredActivityId={hoveredActivityId}
            activities={activities}
            isLoadingActivities={isLoadingActivities}
            activitiesError={activitiesError}
            onSelectArticle={selectArticle}
            onHoverArticle={hoverArticle}
            onHoverActivity={hoverActivity}
          />
        </aside>
        <div className="sticky top-[var(--header-height,4rem)] z-10 -order-1 h-[60vh] md:static md:order-2 md:h-full">
          <TravelMap
            articles={articles}
            activities={activities}
            selectedArticleId={selectedArticleId}
            hoveredArticleId={hoveredArticleId}
            hoveredActivityId={hoveredActivityId}
            onSelectArticle={selectArticle}
            onHoverArticle={hoverArticle}
            onHoverActivity={hoverActivity}
            onViewportChange={setBoundingBoxSearch}
          />
        </div>
      </div>
    </>
  )
}
