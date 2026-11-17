'use client'

import { Check, Plus } from 'lucide-react'

import { useMediaWatchState } from '@/app/media-entertainment/_hooks/useMediaWatchState'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { cn } from '@/lib/utils'

interface MediaEntertainmentListToggleButtonProps {
  title: MediaTitleHit
  /** Icon box size, matching whichever surface it sits on. */
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-10 w-10 [&_svg]:h-5 [&_svg]:w-5',
} as const

/**
 * Add to / remove from My List. The one control behind all three surfaces the
 * ticket names — billboard, poster hover, detail sheet — so they cannot drift out
 * of sync: each reads the same atom, so toggling on one repaints the others.
 */
export const MediaEntertainmentListToggleButton = ({
  title,
  size = 'md',
  className,
}: MediaEntertainmentListToggleButtonProps) => {
  const { isInMyList, toggleMyList } = useMediaWatchState()
  const isSaved = isInMyList(title.objectID)

  return (
    <button
      type="button"
      onClick={(event) => {
        // Every surface this sits on is itself clickable — a card link, a hero
        // slide — and none of them should also fire.
        event.preventDefault()
        event.stopPropagation()
        toggleMyList(title)
      }}
      aria-pressed={isSaved}
      aria-label={
        isSaved
          ? `Remove ${title.title} from My List`
          : `Add ${title.title} to My List`
      }
      title={isSaved ? 'Remove from My List' : 'Add to My List'}
      className={cn(
        // Fully round, not `rounded-button`: it is an icon-only circular control on
        // every surface it sits on, the way the pattern it copies draws it.
        'focus-visible:outline-ring flex cursor-pointer items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        SIZE_CLASSES[size],
        isSaved
          ? 'border-white bg-white/95 text-black hover:bg-white'
          : 'border-white/40 bg-black/40 text-white/80 backdrop-blur-sm hover:border-white hover:text-white',
        className,
      )}>
      {isSaved ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
    </button>
  )
}
