'use client'

import { AnimatePresence, motion } from 'motion/react'

import { StreamingResultsLayout } from '@/features/aiAssistant/components/messages/StreamingResultsLayout'
import { TravelActivityCard } from '@/features/aiAssistant/components/messages/travel/TravelActivityCard'
import { TravelArticleCard } from '@/features/aiAssistant/components/messages/travel/TravelArticleCard'
import { TravelPodcastCard } from '@/features/aiAssistant/components/messages/travel/TravelPodcastCard'
import { TravelResultGroup } from '@/features/aiAssistant/components/messages/travel/TravelResultGroup'
import { MAX_VISIBLE_ITEMS } from '@/features/aiAssistant/constants'
import type {
  TravelDisplayGroup,
  TravelDisplayItem,
  PartialTravelDisplayGroup,
  TravelContentType,
} from '@/features/aiAssistant/types'
import { EASE_SMOOTH } from '@/lib/animations'

interface StreamingTravelGroupProps {
  group: PartialTravelDisplayGroup
  isExpanded?: boolean
}

const renderCard = (
  item: TravelDisplayItem,
  type: TravelContentType | null,
  useGridLayout: boolean,
) => {
  switch (type) {
    case 'articles':
      return (
        <TravelArticleCard
          key={item.objectID}
          item={item}
          variant={useGridLayout ? 'grid' : 'carousel'}
        />
      )
    case 'podcasts':
      return <TravelPodcastCard key={item.objectID} item={item} />
    case 'activities':
      return <TravelActivityCard key={item.objectID} item={item} />
    default:
      // Fallback to article card if type not yet known
      return (
        <TravelArticleCard
          key={item.objectID}
          item={item}
          variant={useGridLayout ? 'grid' : 'carousel'}
        />
      )
  }
}

const StreamingTravelGroup = ({
  group,
  isExpanded = false,
}: StreamingTravelGroupProps) => {
  // Only use grid for articles when expanded
  const useGridLayout = isExpanded && group.type === 'articles'

  const visibleItems = group.items.slice(0, MAX_VISIBLE_ITEMS)
  const isFull = visibleItems.length >= MAX_VISIBLE_ITEMS
  const showSkeleton = !isFull && !group.itemsComplete

  return (
    <div className="space-y-3">
      {/* Group header */}
      <div>
        <h4 className="text-sm font-semibold">{group.title || '...'}</h4>
        {group.why && (
          <p className="text-muted-foreground text-xs">{group.why}</p>
        )}
      </div>

      {/* Grid layout for expanded articles */}
      {useGridLayout && (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence initial={false}>
            {visibleItems.map((item) => (
              <motion.div
                key={item.objectID}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: EASE_SMOOTH }}>
                {renderCard(item, group.type, true)}
              </motion.div>
            ))}
          </AnimatePresence>
          {showSkeleton && (
            <div className="border-border w-full animate-pulse overflow-hidden rounded-lg border">
              <div className="bg-card h-36 w-full" />
              <div className="bg-muted space-y-2 p-3">
                <div className="bg-background/50 h-2.5 w-16 rounded" />
                <div className="bg-background/50 h-4 w-full rounded" />
                <div className="bg-background/50 h-3 w-3/4 rounded" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Carousel layout for everything else */}
      {!useGridLayout && (
        <div className="-mx-4 px-4">
          <div className="scrollbar-slim flex gap-3 overflow-x-auto pb-2">
            <AnimatePresence initial={false}>
              {visibleItems.map((item) => (
                <motion.div
                  key={item.objectID}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: EASE_SMOOTH }}
                  className="shrink-0">
                  {renderCard(item, group.type, false)}
                </motion.div>
              ))}
            </AnimatePresence>
            {showSkeleton && (
              <div className="border-border w-64 shrink-0 animate-pulse overflow-hidden rounded-lg border">
                <div className="bg-card h-36 w-full" />
                <div className="bg-muted space-y-2 p-3">
                  <div className="bg-background/50 h-4 w-full rounded" />
                  <div className="bg-background/50 h-3 w-full rounded" />
                  <div className="bg-background/50 h-3 w-24 rounded" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface StreamingTravelDisplayResultsProps {
  intro: string
  groups: TravelDisplayGroup[]
  streamingGroup: PartialTravelDisplayGroup | null
  isExpanded?: boolean
}

export const StreamingTravelDisplayResults = ({
  intro,
  groups,
  streamingGroup,
  isExpanded = false,
}: StreamingTravelDisplayResultsProps) => (
  <StreamingResultsLayout
    intro={intro}
    groupSlots={groups.map((group, i) => (
      <TravelResultGroup key={i} group={group} isExpanded={isExpanded} />
    ))}
    streamingGroupSlot={
      streamingGroup ? (
        <StreamingTravelGroup group={streamingGroup} isExpanded={isExpanded} />
      ) : null
    }
  />
)
