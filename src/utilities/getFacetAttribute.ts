import type { FacetConfig } from '@/types'

export const getFacetAttribute = (facet: FacetConfig): string =>
  typeof facet.attribute === 'string' ? facet.attribute : facet.attribute[0]
