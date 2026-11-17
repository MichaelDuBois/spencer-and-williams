'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useRefinementList } from 'react-instantsearch'

import {
  CHIP_ACTIVE_CLASS,
  CHIP_CLASS,
  CHIP_COUNT_CLASS,
  CHIP_OPTION_ACTIVE_CLASS,
  CHIP_OPTION_CLASS,
  CHIP_PANEL_CLASS,
  CHIP_PANEL_LIST_CLASS,
} from '@/app/media-entertainment/search/_components/MediaEntertainmentSearchChipVariants'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface MediaEntertainmentFilterChipProps {
  attribute: string
  label: string
}

/** Every genre (27) with room to spare, and a hard four columns of seven in the
 *  panel — see `CHIP_PANEL_LIST_CLASS`. */
const MAX_FACET_VALUES = 28

/**
 * One facet as a chip-plus-popover. Built on the `useRefinementList` hook rather
 * than the widget so there is no `.ais-*` chrome to restyle for the dark theme.
 */
export const MediaEntertainmentFilterChip = ({
  attribute,
  label,
}: MediaEntertainmentFilterChipProps) => {
  const { items, refine } = useRefinementList({
    attribute,
    limit: MAX_FACET_VALUES,
    // No `sortBy`: the connector only honours the response's facetOrdering when
    // the sort is left at its default, so passing one would discard it.
  })
  const [open, setOpen] = useState(false)

  if (!items.length) return null

  const selectedCount = items.filter((item) => item.isRefined).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(CHIP_CLASS, selectedCount > 0 && CHIP_ACTIVE_CLASS)}>
          <span>{label}</span>
          {selectedCount > 0 && (
            <span className={CHIP_COUNT_CLASS}>{selectedCount}</span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn('h-3 w-3 transition-transform', open && 'rotate-180')}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} className={CHIP_PANEL_CLASS}>
        <ul className={CHIP_PANEL_LIST_CLASS}>
          {items.map((item) => (
            <li key={item.value}>
              <label
                className={cn(
                  CHIP_OPTION_CLASS,
                  item.isRefined && CHIP_OPTION_ACTIVE_CLASS,
                )}>
                <input
                  type="checkbox"
                  checked={item.isRefined}
                  onChange={() => refine(item.value)}
                  className="sr-only"
                />
                {/* `record_type` ships lowercase (`movie`, `show`); already-cased
                    values like `PG-13` are untouched by `capitalize`. */}
                <span className="flex-1 truncate capitalize">{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
