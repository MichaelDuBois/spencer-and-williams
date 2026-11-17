'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import type { FacetComponentProps, Variant } from '@/types'
import { parseColorFilterGroup } from '@/utilities/parseColorFilterGroup'

const VARIANT_CLASSES: Record<
  Variant,
  {
    title: string
    list: string
    cell: string
    cellSelected: string
    swatch: string
    swatchSelected: string
    name: string
  }
> = {
  standard: {
    title: 'text-foreground font-medium capitalize',
    list: 'grid grid-cols-5 gap-2',
    cell: 'flex w-full min-w-0 cursor-pointer flex-col items-center gap-2 rounded-button p-2 outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2',
    cellSelected: '',
    swatch: 'border-border h-7 w-7 rounded-full border',
    swatchSelected: 'ring-foreground ring-1 ring-offset-2',
    name: 'capitalize-first w-full truncate text-center text-xs',
  },
  editorial: {
    title: 'text-muted-foreground text-xs tracking-widest uppercase',
    list: 'grid grid-cols-3 gap-2',
    cell: 'rounded-button border-border flex w-full min-w-0 cursor-pointer items-center gap-1.5 border px-2 py-2 text-xs tracking-wide transition-all hover:border-foreground/30',
    cellSelected: 'border-accent bg-accent/5 text-foreground',
    swatch: 'border-border h-3 w-3 shrink-0 rounded-full border',
    swatchSelected: '',
    name: 'capitalize-first truncate',
  },
}

interface ColorRefinementProps extends FacetComponentProps {
  limit?: number
}

export const ColorRefinement = ({
  title,
  attribute,
  defaultOpen = true,
  limit = 10,
  variant = 'standard',
}: ColorRefinementProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const styles = VARIANT_CLASSES[variant]
  const stringAttribute = typeof attribute === 'string' ? attribute : ''
  const { items, refine, canToggleShowMore, isShowingMore, toggleShowMore } =
    useRefinementList({
      attribute: stringAttribute,
      limit,
      showMore: true,
      showMoreLimit: 50,
    })

  if (!stringAttribute) return null

  const swatches = items
    .map((item) => {
      const parsed = parseColorFilterGroup(item.value)
      if (!parsed) return null
      return { ...item, ...parsed }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <div className="border-border border-b py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between text-left">
        <span className={cn(styles.title)}>{title}</span>
        <Plus
          className={cn(
            'text-muted-foreground h-4 w-4 transition-transform duration-500 ease-in-out',
            isOpen && 'rotate-225',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200',
          isOpen
            ? 'mt-3 grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}>
        <div className="overflow-hidden">
          <div className={cn(styles.list)}>
            {swatches.map((swatch) => (
              <Tooltip
                key={swatch.value}
                content={swatch.name}
                className="block w-full min-w-0">
                <button
                  type="button"
                  onClick={() => refine(swatch.value)}
                  aria-pressed={swatch.isRefined}
                  className={cn(
                    styles.cell,
                    swatch.isRefined && styles.cellSelected,
                  )}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      styles.swatch,
                      swatch.isRefined && styles.swatchSelected,
                    )}
                    style={{ background: swatch.hex }}
                  />
                  <span className={cn(styles.name)}>{swatch.name}</span>
                </button>
              </Tooltip>
            ))}
          </div>
          {canToggleShowMore && (
            <button
              type="button"
              onClick={toggleShowMore}
              className="text-muted-foreground hover:text-foreground mt-3 cursor-pointer text-xs underline">
              {isShowingMore ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
