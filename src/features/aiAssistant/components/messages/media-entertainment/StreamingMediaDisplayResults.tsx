'use client'

import { AnimatePresence, motion } from 'motion/react'

import { MAX_VISIBLE_TITLES } from '@/features/aiAssistant/components/messages/media-entertainment/constants'
import { MediaAssistantTitleCard } from '@/features/aiAssistant/components/messages/media-entertainment/MediaAssistantTitleCard'
import { MediaTitleCardSkeleton } from '@/features/aiAssistant/components/messages/media-entertainment/MediaTitleCardSkeleton'
import { MediaTitleResultGroup } from '@/features/aiAssistant/components/messages/media-entertainment/MediaTitleResultGroup'
import { StreamingResultsLayout } from '@/features/aiAssistant/components/messages/StreamingResultsLayout'
import type {
  MediaDisplayGroup,
  PartialMediaDisplayGroup,
} from '@/features/aiAssistant/types'
import { transitionSmooth } from '@/lib/animations'

interface StreamingMediaGroupProps {
  group: PartialMediaDisplayGroup
}

const StreamingMediaGroup = ({ group }: StreamingMediaGroupProps) => {
  const visibleItems = group.items.slice(0, MAX_VISIBLE_TITLES)
  const isFull = visibleItems.length >= MAX_VISIBLE_TITLES
  const showSkeleton = !isFull && !group.itemsComplete

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">{group.title || '...'}</h4>
        {group.why && (
          <p className="text-muted-foreground mt-0.5 text-xs">{group.why}</p>
        )}
      </div>

      <div className="-mx-4 px-4">
        <div className="scrollbar-slim flex gap-2 overflow-x-auto pt-1 pb-2">
          <AnimatePresence initial={false}>
            {visibleItems.map((item) => (
              <motion.div
                key={item.objectID}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transitionSmooth}
                className="shrink-0">
                <MediaAssistantTitleCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
          {showSkeleton && <MediaTitleCardSkeleton />}
        </div>
      </div>
    </div>
  )
}

interface StreamingMediaDisplayResultsProps {
  intro: string
  answer?: string
  groups: MediaDisplayGroup[]
  streamingGroup: PartialMediaDisplayGroup | null
}

export const StreamingMediaDisplayResults = ({
  intro,
  answer,
  groups,
  streamingGroup,
}: StreamingMediaDisplayResultsProps) => (
  <StreamingResultsLayout
    intro={intro}
    answer={answer}
    groupSlots={groups.map((group, index) => (
      <MediaTitleResultGroup key={index} group={group} />
    ))}
    streamingGroupSlot={
      streamingGroup ? <StreamingMediaGroup group={streamingGroup} /> : null
    }
  />
)
