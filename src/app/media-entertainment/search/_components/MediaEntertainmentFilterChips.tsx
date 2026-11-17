'use client'

import { useDynamicWidgets } from 'react-instantsearch'

import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { MediaEntertainmentFilterChip } from '@/app/media-entertainment/search/_components/MediaEntertainmentFilterChip'
import { ClearAllButton } from '@/components/filters/ClearAllButton'
import { SortByWidget } from '@/components/results/SortByWidget'
import { getFacetAttribute } from '@/utilities/getFacetAttribute'
import { getOrderedFacets } from '@/utilities/getOrderedFacets'

const { primaryIndex } = mediaEntertainmentConfig.algolia

const REFINEMENT_FACETS = (primaryIndex.facets ?? []).filter(
  (facet) => facet.type === 'refinement',
)

interface MediaEntertainmentFilterChipsProps {
  /**
   * Attributes a section already locks through `filters`. Their chip has to go:
   * a refinement on the same attribute ANDs with the lock and returns nothing.
   */
  hiddenFacets?: string[]
}

/**
 * The chip row that stands in for a sidebar: browse-first surfaces keep the
 * posters full width, so filters live inline above the grid.
 */
export const MediaEntertainmentFilterChips = ({
  hiddenFacets = [],
}: MediaEntertainmentFilterChipsProps) => {
  // Chip order follows the response's facetOrdering, so Dynamic Facet Ordering
  // re-arranges the row; it falls back to config order when none comes back.
  const { attributesToRender } = useDynamicWidgets({
    facets: ['*'],
    maxValuesPerFacet: 10,
  })

  const facets = getOrderedFacets(REFINEMENT_FACETS, attributesToRender)

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {facets
        .map((facet) => {
          return { attribute: getFacetAttribute(facet), label: facet.label }
        })
        .filter(({ attribute }) => !hiddenFacets.includes(attribute))
        .map(({ attribute, label }) => (
          <MediaEntertainmentFilterChip
            key={attribute}
            attribute={attribute}
            label={label}
          />
        ))}
      <ClearAllButton />
      <div className="ml-auto">
        <SortByWidget primaryIndex={primaryIndex} />
      </div>
    </div>
  )
}
