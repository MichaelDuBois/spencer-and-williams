'use client'

import { useAtomValue } from 'jotai'

import {
  searchClientAtom,
  searchClientKeyAtom,
  type SearchClientKey,
} from '@/stores/searchClient'

import type { liteClient } from 'algoliasearch/lite'

export interface UseSearchClientResult {
  client: ReturnType<typeof liteClient> | null
  key: SearchClientKey | null
}

/**
 * The installed search client together with the identity of the pipeline it
 * answers through.
 *
 * **Any hook that caches results from this client must fold `key` into its
 * `queryKey`.** Swapping the client changes no search parameter, so nothing
 * else can invalidate the cache when the composition toggle moves: the query
 * keeps serving the outgoing pipeline's results until it happens to refetch,
 * and the cache mixes standard and composition results under one key.
 *
 * The pair is returned together precisely so the key travels with the client —
 * reach for the client here and its cache dimension is already in hand. See
 * `src/stores/searchClient.ts` for why the key, and never the
 * `compositionEnabled` toggle, is the thing to key on.
 */
export const useSearchClient = (): UseSearchClientResult => {
  return {
    client: useAtomValue(searchClientAtom),
    key: useAtomValue(searchClientKeyAtom),
  }
}
