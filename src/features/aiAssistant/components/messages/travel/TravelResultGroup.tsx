'use client'

import { ResultGroupShell } from '@/features/aiAssistant/components/messages/ResultGroupShell'
import { TravelActivityCard } from '@/features/aiAssistant/components/messages/travel/TravelActivityCard'
import { TravelArticleCard } from '@/features/aiAssistant/components/messages/travel/TravelArticleCard'
import { TravelPodcastCard } from '@/features/aiAssistant/components/messages/travel/TravelPodcastCard'
import { MOBILE_BREAKPOINT } from '@/features/aiAssistant/constants'
import { MAX_VISIBLE_ITEMS } from '@/features/aiAssistant/constants'
import type { TravelDisplayGroup } from '@/features/aiAssistant/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface TravelResultGroupProps {
  group: TravelDisplayGroup
  isExpanded?: boolean
  query?: string
}

/**
 * Group of travel content with title, description, and layout based on type and expansion state.
 * - Non-expanded: Always carousel for all types
 * - Expanded (desktop): Grid 2x2 for articles, carousel for podcasts & activities
 * - Mobile: Always carousel for all types
 */
export const TravelResultGroup = ({
  group,
  isExpanded = false,
  query,
}: TravelResultGroupProps) => {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)
  // Only use grid for articles when expanded and not on mobile
  const useGridLayout = isExpanded && group.type === 'articles' && !isMobile

  // Render the appropriate card based on content type
  const renderCard = (item: TravelDisplayGroup['items'][0]) => {
    switch (group.type) {
      case 'articles':
        return (
          <TravelArticleCard
            key={item.objectID}
            item={item}
            variant={useGridLayout ? 'grid' : 'carousel'}
          />
        )
      case 'podcasts':
        return (
          <TravelPodcastCard
            key={item.objectID}
            item={item}
            isExpanded={isExpanded}
          />
        )
      case 'activities':
        return <TravelActivityCard key={item.objectID} item={item} />
      default:
        return null
    }
  }

  return (
    <ResultGroupShell
      title={group.title}
      why={group.why}
      query={query}
      titleClassName="font-semibold">
      {/* Grid layout for expanded articles */}
      {useGridLayout && (
        <div className="grid grid-cols-2 gap-3">
          {group.items.slice(0, MAX_VISIBLE_ITEMS).map(renderCard)}
        </div>
      )}

      {/* Horizontal carousel for everything else */}
      {!useGridLayout && (
        <div className="-mx-4 px-4">
          <div className="scrollbar-slim flex gap-3 overflow-x-auto pb-2">
            {group.items.slice(0, MAX_VISIBLE_ITEMS).map(renderCard)}
          </div>
        </div>
      )}
    </ResultGroupShell>
  )
}
