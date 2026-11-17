import {
  combineAlgoliaFilters,
  getObjectIdFilter,
} from '@/utilities/algoliaFilters'
import { isRecord } from '@/utilities/isRecord'

import type { LiteClient } from 'algoliasearch/lite'

export const fetchB2BCartProducts = async (
  client: LiteClient,
  indexName: string,
  objectIDs: string[],
  filters: string,
  signal?: AbortSignal,
): Promise<Record<string, unknown>[]> => {
  signal?.throwIfAborted()
  const response = await client.search<Record<string, unknown>>(
    objectIDs.map((objectID) => {
      return {
        indexName,
        params: {
          hitsPerPage: 1,
          filters: combineAlgoliaFilters(getObjectIdFilter(objectID), filters),
        },
      }
    }),
  )
  signal?.throwIfAborted()
  if (
    !Array.isArray(response.results) ||
    response.results.length !== objectIDs.length
  )
    throw new Error('Cart validation failed')
  return response.results.flatMap((result, index) => {
    if (!('hits' in result) || !Array.isArray(result.hits))
      throw new Error('Cart validation failed')
    const hit = result.hits[0]
    return isRecord(hit) && hit.objectID === objectIDs[index] ? [hit] : []
  })
}
