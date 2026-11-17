'use client'

import { RotateCw } from 'lucide-react'

import { RAIL_GUTTER_CLASS } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { cn } from '@/lib/utils'

interface MediaEntertainmentBrowseErrorProps {
  onRetry: () => void
}
export const MediaEntertainmentBrowseError = ({
  onRetry,
}: MediaEntertainmentBrowseErrorProps) => (
  <div
    className={cn(
      'flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center',
      RAIL_GUTTER_CLASS,
    )}>
    <h1 className="font-secondary text-foreground text-2xl uppercase md:text-3xl">
      Nothing to browse right now
    </h1>

    <p className="text-muted-foreground max-w-md text-sm md:text-base">
      We couldn&apos;t load the catalogue. Check the connection and try again.
    </p>

    <button
      type="button"
      onClick={onRetry}
      className="rounded-button bg-accent hover:bg-accent/85 focus-visible:outline-ring mt-2 inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
      <RotateCw aria-hidden="true" className="h-4 w-4" />
      Try again
    </button>
  </div>
)
