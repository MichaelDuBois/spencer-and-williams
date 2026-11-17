import { liteClient } from 'algoliasearch/lite'
import { atom } from 'jotai'

export const searchClientAtom = atom<ReturnType<typeof liteClient> | null>(null)
export const baseSearchClientAtom = atom<ReturnType<typeof liteClient> | null>(
  null,
)

/**
 * Which pipeline the client in `searchClientAtom` answers through. Written in
 * the same commit as the client itself, so it identifies the client actually
 * installed rather than the toggle's intent.
 *
 * Anything that caches results has to fold this in: swapping the client changes
 * no search parameter, so neither React Query keys nor the `useInfiniteHits`
 * page cache would otherwise notice. Read this rather than the demo toggle —
 * the toggle flips during render while the client is swapped in an effect, so
 * invalidating on the toggle lands a render too early and caches the outgoing
 * client's results under the incoming client's key.
 */
export type SearchClientKey = 'composition' | 'standard'

export const searchClientKeyAtom = atom<SearchClientKey | null>(null)
