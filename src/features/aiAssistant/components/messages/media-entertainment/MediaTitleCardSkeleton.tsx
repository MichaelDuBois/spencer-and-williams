import { CARD_WIDTH_CLASS } from '@/features/aiAssistant/components/messages/media-entertainment/constants'

/**
 * Stands in for a poster the shelf hasn't resolved yet — either a title still
 * being fetched, or one the agent has yet to name while it streams.
 */
export const MediaTitleCardSkeleton = () => (
  <div className={`${CARD_WIDTH_CLASS} shrink-0 space-y-1.5`}>
    <div className="bg-card rounded-image aspect-[2/3] w-full animate-pulse" />
    <div className="bg-card h-2.5 w-3/4 animate-pulse rounded" />
  </div>
)
