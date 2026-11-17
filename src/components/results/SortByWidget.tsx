'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSortBy } from 'react-instantsearch'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Variant } from '@/types'
import type { IndexConfig } from '@/types/verticalConfig.types'

interface SortByWidgetProps {
  primaryIndex: Pick<IndexConfig, 'name' | 'replicas'>
  variant?: Variant
  className?: string
}

const VARIANT_CLASSES: Record<
  Variant,
  {
    trigger: string
    chevron: string
    menu: string
    menuItem: string
    menuItemActive: string
  }
> = {
  standard: {
    trigger:
      'text-foreground hover:text-muted-foreground inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors focus:outline-none',
    chevron: 'text-muted-foreground h-3 w-3',
    menu: 'min-w-45 overflow-hidden py-1',
    menuItem:
      'text-foreground hover:bg-muted/60 flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-left text-xs transition-colors',
    menuItemActive: 'font-medium',
  },
  editorial: {
    trigger:
      'text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 text-xs tracking-widest uppercase transition-colors focus:outline-none',
    chevron: 'text-foreground/60 h-3 w-3',
    menu: 'min-w-50 overflow-hidden py-2',
    menuItem:
      'text-foreground hover:bg-muted/40 flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left text-xs tracking-widest uppercase transition-colors',
    menuItemActive: 'text-foreground',
  },
}

export const SortByWidget = ({
  primaryIndex,
  variant = 'standard',
  className,
}: SortByWidgetProps) => {
  const items = useMemo(
    () => [
      { label: 'Relevance', value: primaryIndex.name },
      ...(primaryIndex.replicas ?? []).map((item) => {
        return { label: item.label, value: item.indexName }
      }),
    ],
    [primaryIndex.name, primaryIndex.replicas],
  )

  const { currentRefinement, refine, options } = useSortBy({ items })
  const [open, setOpen] = useState(false)

  if (!primaryIndex.replicas?.length) return null

  const classes = VARIANT_CLASSES[variant]
  const current = options.find((o) => o.value === currentRefinement) ?? items[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(classes.trigger, className)}>
          <span>{current.label}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              classes.chevron,
              'transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className={cn('w-auto p-0', classes.menu)}>
        <ul>
          {options.map((option) => {
            const isActive = option.value === currentRefinement
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-current={isActive}
                  onClick={() => {
                    refine(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    classes.menuItem,
                    isActive && classes.menuItemActive,
                  )}>
                  <span>{option.label}</span>
                  {isActive && (
                    <Check
                      aria-hidden="true"
                      className="text-accent h-3.5 w-3.5"
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
