'use client'

import { useCallback } from 'react'

import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { CARD_WIDTH_CLASS } from '@/features/aiAssistant/components/messages/media-entertainment/constants'
import { MediaTitleCardSkeleton } from '@/features/aiAssistant/components/messages/media-entertainment/MediaTitleCardSkeleton'
import { getMediaTitleQueryKey } from '@/features/aiAssistant/hooks/search/useMediaEntertainmentSearch'
import { useCardData } from '@/features/aiAssistant/hooks/useCachedContent'
import type { MediaDisplayItem } from '@/features/aiAssistant/types'
import { track } from '@/lib/analytics/track'

/** The poster runs at a single width, so `sizes` is a single value too. */
const CARD_SIZES = '112px'

interface MediaAssistantTitleCardProps {
  item: MediaDisplayItem
  directData?: MediaTitleHit
}

/**
 * One title in an assistant answer.
 *
 * Renders the vertical's own `MediaEntertainmentPosterCard` unchanged, so a
 * recommendation looks identical to a title on a homepage rail — the artwork, the
 * hover metadata, the add-to-list control and the click-to-open-detail behaviour
 * all come for free. What this adds is resolving the agent's objectID to a title,
 * and showing the agent's reason underneath, which a rail has no concept of.
 */
export const MediaAssistantTitleCard = ({
  item,
  directData: title,
}: MediaAssistantTitleCardProps) => {
  const resolvedTitle = useCardData(title, getMediaTitleQueryKey(item.objectID))
  const handleOpen = useCallback(() => {
    track('assistant_result_clicked', {
      surface: 'ai_assistant',
      objectID: item.objectID,
    })
  }, [item.objectID])

  if (!resolvedTitle) return <MediaTitleCardSkeleton />

  return (
    <div className={`${CARD_WIDTH_CLASS} shrink-0 space-y-1.5`}>
      <MediaEntertainmentPosterCard
        title={resolvedTitle}
        sizes={CARD_SIZES}
        onOpen={handleOpen}
      />
      {item.why && (
        <p className="text-muted-foreground line-clamp-3 text-xs leading-snug">
          {item.why}
        </p>
      )}
    </div>
  )
}
