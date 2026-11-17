/**
 * Narrows one entry of an Algolia `search([...])` response.
 *
 * A multi-query batch returns a positional array whose entries are not
 * guaranteed to be hit responses: a facet-only query returns `{ facetHits }`, a
 * failed query returns an error shape, and an over-sliced batch returns
 * `undefined`. Reading `.hits` off any of those throws and takes the whole
 * surface down with it, so every caller gets an empty hit list instead.
 *
 * Prefer this over an inline `'hits' in result ? result.hits : []`: it also
 * carries `queryID` through, which is what click-and-conversion events need to
 * attribute back to the query that produced the hit.
 */
export interface AlgoliaResultHits {
  hits: Record<string, unknown>[]
  queryID?: string
}

export const getResultHits = (result: unknown): AlgoliaResultHits => {
  if (!result || typeof result !== 'object') return { hits: [] }

  const { hits, queryID } = result as { hits?: unknown; queryID?: unknown }

  return {
    hits: Array.isArray(hits) ? (hits as Record<string, unknown>[]) : [],
    queryID: typeof queryID === 'string' ? queryID : undefined,
  }
}
