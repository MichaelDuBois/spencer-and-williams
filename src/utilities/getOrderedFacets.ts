import type { FacetConfig } from '@/types'
import { getFacetAttribute } from '@/utilities/getFacetAttribute'

export const getOrderedFacets = (
  facets: FacetConfig[],
  attributesToRender: readonly string[],
): FacetConfig[] => {
  if (attributesToRender.length === 0) return facets

  const facetByAttribute = new Map(
    facets.map((facet) => [getFacetAttribute(facet), facet]),
  )

  return attributesToRender
    .map((attr) => facetByAttribute.get(attr))
    .filter((facet) => facet !== undefined)
}
