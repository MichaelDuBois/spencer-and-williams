'use client'

import { useClearRefinements } from 'react-instantsearch'

import { cn } from '@/lib/utils'
import type { Variant } from '@/types'

interface ClearAllButtonProps {
  variant?: Variant
}

export const ClearAllButton = ({
  variant = 'standard',
}: ClearAllButtonProps) => {
  const { refine, canRefine } = useClearRefinements()

  if (!canRefine) return null

  return (
    <button
      type="button"
      onClick={refine}
      className={cn(
        'text-muted-foreground hover:text-accent cursor-pointer transition-colors',
        variant === 'editorial'
          ? 'text-xs tracking-widest uppercase'
          : 'text-sm',
      )}>
      Clear all
    </button>
  )
}
