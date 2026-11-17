'use client'

import { useDynamicWidgets } from 'react-instantsearch'

import { ColorRefinement } from '@/components/filters/ColorRefinement'
import { FilterSection } from '@/components/filters/FilterSection'
import { HierarchicalFacet } from '@/components/filters/HierarchicalFacet'
import { RangeFacet } from '@/components/filters/RangeFacet'
import { SizeFacet } from '@/components/filters/SizeFacet'
import type {
  FacetComponentProps,
  FacetConfig,
  FacetType,
  Variant,
} from '@/types'
import { getFacetAttribute } from '@/utilities/getFacetAttribute'
import { getOrderedFacets } from '@/utilities/getOrderedFacets'

import type { ComponentType } from 'react'

const FACET_COMPONENTS: Record<
  FacetType,
  ComponentType<FacetComponentProps>
> = {
  refinement: FilterSection,
  slider: RangeFacet,
  hierarchical: HierarchicalFacet,
  color: ColorRefinement,
  size: SizeFacet,
}

interface FacetFiltersProps {
  facets: FacetConfig[]
  defaultOpenCount?: number
  variant?: Variant
  renderFacet?: (facet: FacetConfig, index: number) => React.ReactNode
}

export const FacetFilters = ({
  facets,
  defaultOpenCount = 2,
  variant = 'standard',
  renderFacet,
}: FacetFiltersProps) => {
  const { attributesToRender } = useDynamicWidgets({
    facets: ['*'],
    maxValuesPerFacet: 10,
  })
  const orderedFacets = getOrderedFacets(facets, attributesToRender)

  const defaultRenderFacet = (facet: FacetConfig, index: number) => {
    const Component = FACET_COMPONENTS[facet.type]
    return (
      <Component
        key={getFacetAttribute(facet)}
        title={facet.label}
        attribute={facet.attribute}
        prefix={facet.prefix}
        defaultOpen={facet.defaultOpen ?? index < defaultOpenCount}
        variant={variant}
      />
    )
  }

  if (!orderedFacets.length) return null
  return (
    <div className="divide-border divide-y">
      {orderedFacets.map(
        (facet, index) =>
          renderFacet?.(facet, index) ?? defaultRenderFacet(facet, index),
      )}
    </div>
  )
}
