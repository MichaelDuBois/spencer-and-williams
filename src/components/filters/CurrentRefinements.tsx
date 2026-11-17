'use client'

import { X } from 'lucide-react'
import { useCurrentRefinements } from 'react-instantsearch'

import { cn } from '@/lib/utils'
import type { FacetConfig, Variant } from '@/types'
import { getFacetAttribute } from '@/utilities/getFacetAttribute'
import { parseColorFilterGroup } from '@/utilities/parseColorFilterGroup'

interface CurrentRefinementsProps {
  facets?: FacetConfig[]
  variant?: Variant
}

const HIERARCHICAL_SEPARATOR = ' > '

const capitalizeHierarchicalLabel = (label: string) =>
  label
    .split(HIERARCHICAL_SEPARATOR)
    .map((segment) =>
      segment.length > 0
        ? segment.charAt(0).toUpperCase() + segment.slice(1)
        : segment,
    )
    .join(HIERARCHICAL_SEPARATOR)

const getValueLabel = (facet: FacetConfig | undefined, value: string) =>
  Object.entries(facet?.valueLabels ?? {}).find(
    ([key]) => key.toLowerCase() === value.toLowerCase(),
  )?.[1]

const VARIANT_CLASSES = {
  standard: {
    badge: 'bg-muted flex items-center gap-1 rounded-full px-3 py-1 text-sm',
    label: 'text-muted-foreground capitalize',
    value: 'text-foreground',
    valueCase: 'capitalize-first',
    icon: 'text-muted-foreground hover:text-foreground h-3.5 w-3.5',
  },
  editorial: {
    badge:
      'bg-muted flex items-center gap-1 rounded-full px-2.5 py-1 text-xs tracking-wide',
    label: 'text-muted-foreground uppercase',
    value: 'text-foreground',
    valueCase: '',
    icon: 'text-muted-foreground hover:text-foreground h-3 w-3',
  },
} as const

export const CurrentRefinements = ({
  facets = [],
  variant = 'standard',
}: CurrentRefinementsProps) => {
  const { items, refine } = useCurrentRefinements()
  const classes = VARIANT_CLASSES[variant]

  if (!items.length) return null

  const facetByAttribute = new Map(
    facets.map((facet) => [getFacetAttribute(facet), facet]),
  )

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((item) => {
        const facet = facetByAttribute.get(item.attribute)
        const label = facet?.label ?? item.label
        const isColor = facet?.type === 'color'
        const isHierarchical = facet?.type === 'hierarchical'

        return (
          <div key={item.attribute} className={cn(classes.badge)}>
            <span className={cn(classes.label)}>{label}:</span>
            {isColor ? (
              <span
                className={cn(
                  classes.value,
                  classes.valueCase,
                  'flex flex-wrap items-center gap-x-1.5',
                )}>
                {item.refinements.map((r, i) => {
                  const parsed = parseColorFilterGroup(String(r.value))
                  if (!parsed) return null
                  const isLast = i === item.refinements.length - 1
                  return (
                    <span
                      key={String(r.value)}
                      className="inline-flex items-center gap-1">
                      <span
                        aria-hidden="true"
                        className="border-border inline-block h-3 w-3 rounded-full border"
                        style={{ background: parsed.hex }}
                      />
                      <span className="capitalize-first">
                        {parsed.name}
                        {!isLast && ','}
                      </span>
                    </span>
                  )
                })}
              </span>
            ) : (
              <span
                className={cn(
                  classes.value,
                  !isHierarchical && classes.valueCase,
                )}>
                {item.refinements
                  .map((r) =>
                    isHierarchical
                      ? capitalizeHierarchicalLabel(r.label)
                      : (getValueLabel(facet, String(r.value)) ?? r.label),
                  )
                  .join(', ')}
              </span>
            )}
            <button
              type="button"
              onClick={() => item.refinements.forEach((r) => refine(r))}
              className="hover:text-accent ml-1 cursor-pointer transition-colors">
              <X className={cn(classes.icon)} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
