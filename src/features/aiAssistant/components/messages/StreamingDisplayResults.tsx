'use client'

import { CarouselResultGroup } from '@/features/aiAssistant/components/messages/CarouselResultGroup'
import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { StreamingResultGroup } from '@/features/aiAssistant/components/messages/StreamingResultGroup'
import { StreamingResultsLayout } from '@/features/aiAssistant/components/messages/StreamingResultsLayout'
import type {
  DisplayGroup,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'

interface StreamingDisplayResultsProps extends ProductCarouselPresentation {
  intro: string
  groups: DisplayGroup[]
  streamingGroup: PartialDisplayGroup | null
}

/** Generic streaming display for carousel-based product verticals. */
export const StreamingDisplayResults = ({
  intro,
  groups,
  streamingGroup,
  ...presentation
}: StreamingDisplayResultsProps) => (
  <StreamingResultsLayout
    intro={intro}
    groupSlots={groups.map((group, i) => (
      <CarouselResultGroup key={i} group={group} {...presentation} />
    ))}
    streamingGroupSlot={
      streamingGroup ? (
        <StreamingResultGroup group={streamingGroup} {...presentation} />
      ) : null
    }
  />
)
