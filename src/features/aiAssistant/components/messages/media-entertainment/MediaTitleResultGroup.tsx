'use client'

import { MAX_VISIBLE_TITLES } from '@/features/aiAssistant/components/messages/media-entertainment/constants'
import { MediaAssistantTitleCard } from '@/features/aiAssistant/components/messages/media-entertainment/MediaAssistantTitleCard'
import { ResultGroupShell } from '@/features/aiAssistant/components/messages/ResultGroupShell'
import type { MediaDisplayGroup } from '@/features/aiAssistant/types'

interface MediaTitleResultGroupProps {
  group: MediaDisplayGroup
  query?: string
}

/**
 * A group of recommended titles.
 *
 * Always a horizontal track of posters, at every width and both panel states —
 * unlike travel, which switches to a grid when expanded. Posters are narrow
 * enough that a row of them reads as a shelf, which is the browse idiom this
 * vertical is built on; a 2x2 grid of them would read as a search result page.
 */
export const MediaTitleResultGroup = ({
  group,
  query,
}: MediaTitleResultGroupProps) => (
  <ResultGroupShell
    title={group.title}
    why={group.why}
    query={query}
    titleClassName="font-semibold">
    {/* Negative margin lets the track bleed to the bubble's padding edge, so a
        scrolled poster is clipped by the bubble rather than floating inside it. */}
    <div className="-mx-4 px-4">
      <div className="scrollbar-slim flex gap-2 overflow-x-auto pt-1 pb-2">
        {group.items.slice(0, MAX_VISIBLE_TITLES).map((item) => (
          <MediaAssistantTitleCard key={item.objectID} item={item} />
        ))}
      </div>
    </div>
  </ResultGroupShell>
)
