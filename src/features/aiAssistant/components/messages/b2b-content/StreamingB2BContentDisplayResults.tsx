'use client'

import { AnimatePresence, motion } from 'motion/react'

import { B2BContentCard } from '@/features/aiAssistant/components/messages/b2b-content/B2BContentCard'
import { B2BContentResultGroup } from '@/features/aiAssistant/components/messages/b2b-content/B2BContentResultGroup'
import { StreamingResultsLayout } from '@/features/aiAssistant/components/messages/StreamingResultsLayout'
import { MOBILE_BREAKPOINT } from '@/features/aiAssistant/constants'
import { MAX_VISIBLE_ITEMS } from '@/features/aiAssistant/constants'
import type {
  B2BContentDisplayGroup,
  PartialB2BContentDisplayGroup,
} from '@/features/aiAssistant/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { EASE_SMOOTH } from '@/lib/animations'

interface StreamingB2BContentGroupProps {
  group: PartialB2BContentDisplayGroup
  isExpanded?: boolean
}

const StreamingB2BContentGroup = ({
  group,
  isExpanded = false,
}: StreamingB2BContentGroupProps) => {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)
  const useGridLayout =
    isExpanded &&
    !isMobile &&
    (group.type === 'documentation' || group.type === 'articles')

  const visibleItems = Array.from(
    new Map(group.items.map((item) => [item.objectID, item])).values(),
  ).slice(0, MAX_VISIBLE_ITEMS)
  const isFull = visibleItems.length >= MAX_VISIBLE_ITEMS
  const showSkeleton = !isFull && !group.itemsComplete

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">{group.title || '...'}</h4>
        {group.why && (
          <p className="text-muted-foreground text-xs">{group.why}</p>
        )}
      </div>

      {useGridLayout && (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence initial={false}>
            {visibleItems.map((item) => (
              <motion.div
                key={item.objectID}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: EASE_SMOOTH }}>
                <B2BContentCard item={item} type={group.type} variant="grid" />
              </motion.div>
            ))}
          </AnimatePresence>
          {showSkeleton && (
            <div className="border-border w-full animate-pulse rounded-lg border p-3">
              <div className="flex gap-3">
                <div className="bg-card h-10 w-10 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="bg-background/50 h-4 w-full rounded" />
                  <div className="bg-background/50 h-3 w-3/4 rounded" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
                  <B2BContentCard
                    item={item}
                    type={group.type}
                    variant="carousel"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {showSkeleton && (
              <div className="border-border w-64 shrink-0 animate-pulse overflow-hidden rounded-lg border">
                <div className="bg-card h-32 w-full" />
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

interface StreamingB2BContentDisplayResultsProps {
  intro: string
  answer?: string
  groups: B2BContentDisplayGroup[]
  streamingGroup: PartialB2BContentDisplayGroup | null
  isExpanded?: boolean
}

export const StreamingB2BContentDisplayResults = ({
  intro,
  answer,
  groups,
  streamingGroup,
  isExpanded = false,
}: StreamingB2BContentDisplayResultsProps) => (
  <StreamingResultsLayout
    intro={intro}
    answer={answer}
    groupSlots={groups.map((group, i) => (
      <B2BContentResultGroup key={i} group={group} isExpanded={isExpanded} />
    ))}
    streamingGroupSlot={
      streamingGroup ? (
        <StreamingB2BContentGroup
          group={streamingGroup}
          isExpanded={isExpanded}
        />
      ) : null
    }
  />
)
