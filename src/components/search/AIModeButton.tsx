'use client'

import { Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

export type AIModeButtonSize = 'xs' | 'sm' | 'lg'

interface AIModeButtonProps {
  onClick: () => void
  size?: AIModeButtonSize
  /** Collapses to a 36px icon-only circle with an `aria-label` instead of the text. */
  showLabel?: boolean
  className?: string
}

export const AIModeButton = ({
  onClick,
  size = 'sm',
  showLabel = true,
  className,
}: AIModeButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    // Labelled variant is named by its own text.
    aria-label={showLabel ? undefined : 'AI Mode'}
    className={cn(
      'group flex shrink-0 cursor-pointer items-center rounded-full transition-all',
      // Icon-only is a bare header glyph — no pill chrome, and the caller owns
      // its colour so it can match the icons it sits beside.
      showLabel ? cn(PILL_CLASSES, SIZE_CLASSES[size]) : ICON_ONLY_CLASSES,
      className,
    )}>
    <Sparkles
      className={cn(
        'shrink-0 transition-colors',
        // The pill's glyph is the accent; icon-only inherits the button's own
        // colour instead, like every other header glyph.
        showLabel
          ? cn('text-accent group-hover:text-white', ICON_CLASSES[size])
          : ICON_ONLY_GLYPH_CLASSES,
      )}
    />
    {showLabel && <span className="group-hover:text-white">AI Mode</span>}
  </button>
)

// ai-mode-button is a styling hook for per-theme refinements in globals.css.
const PILL_CLASSES =
  'ai-mode-button border-accent text-foreground hover:bg-accent border font-medium whitespace-nowrap'

const SIZE_CLASSES: Record<AIModeButtonSize, string> = {
  xs: 'gap-1 px-2 py-0.5 text-xs',
  sm: 'gap-1.5 px-3 py-1 text-sm',
  lg: 'gap-1.5 px-3 py-2 text-sm',
}

const ICON_CLASSES: Record<AIModeButtonSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  lg: 'h-3.5 w-3.5',
}

/** Matches the 36px circular footprint of a header icon button. */
const ICON_ONLY_CLASSES = 'h-9 w-9 justify-center'

/** Same 20px glyph as the search icon it pairs with. */
const ICON_ONLY_GLYPH_CLASSES = 'h-5 w-5'
