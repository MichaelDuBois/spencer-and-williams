'use client'

import { Check } from 'lucide-react'

import { useB2BVisibilityFacet } from '@/app/b2b-warehouse/_hooks/useB2BVisibilityFacet'
import { B2B_VISIBILITY_FACET } from '@/app/b2b-warehouse/config'
import { cn } from '@/lib/utils'

interface B2BVisibilityFacetProps {
  groupId: string | null
}

export const B2BVisibilityFacet = ({ groupId }: B2BVisibilityFacetProps) => {
  const { groups, refine } = useB2BVisibilityFacet(groupId)

  return (
    <div
      role="group"
      aria-labelledby="customer-group-filter-title"
      className="border-border border-b pb-4">
      <h2
        id="customer-group-filter-title"
        className="text-foreground pb-1 font-medium">
        {B2B_VISIBILITY_FACET.label}
      </h2>
      <p className="text-muted-foreground text-xs">
        Filter products by group. Choose a persona to apply its pricing.
      </p>
      <div className="mt-2 space-y-2.5">
        {groups.map((group) => {
          const isSelected = group.isSelected
          return (
            <label
              key={group.groupId}
              className={cn(
                'flex items-center gap-2 text-sm transition-colors',
                isSelected
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground',
                groupId
                  ? 'cursor-default'
                  : 'hover:text-foreground cursor-pointer',
              )}>
              <input
                type="checkbox"
                aria-label={group.label}
                className="peer sr-only"
                checked={isSelected}
                disabled={groupId !== null}
                onChange={() => refine(group.refinementValue)}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'border-border bg-background peer-focus-visible:ring-accent rounded-input flex h-4 w-4 shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
                  isSelected &&
                    (groupId
                      ? 'border-muted-foreground bg-muted-foreground text-background'
                      : 'border-accent bg-accent text-accent-foreground'),
                )}>
                {isSelected && <Check className="h-3 w-3" />}
              </span>
              <span>
                <span className="block">{group.label}</span>
                {groupId === group.groupId && (
                  <span className="text-muted-foreground block text-xs font-normal">
                    {group.description}
                  </span>
                )}
              </span>
              {groupId && isSelected && (
                <span className="text-muted-foreground/70 text-xs">
                  Current persona
                </span>
              )}
            </label>
          )
        })}
      </div>
      {groupId && (
        <p className="text-muted-foreground text-micro mt-3">
          Change persona to clear this group.
        </p>
      )}
    </div>
  )
}
