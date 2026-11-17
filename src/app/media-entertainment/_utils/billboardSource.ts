import type { MediaQuerySpec } from '@/app/media-entertainment/_utils/buildRailRequests'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'
import { getObjectIdFilter } from '@/utilities/algoliaFilters'

export interface MediaBillboardQuery {
  ruleContexts?: string[] // highest precedence
  objectIDs?: string[] // curated override, order preserved
  fallbackFilters?: string // always queried, so the hero can't be empty
  limit?: number // overrides DEFAULT_BILLBOARD_LIMIT; also sizes the overfetch
}

export const BILLBOARD_QUERY: MediaBillboardQuery = {
  ruleContexts: ['homepage_me_billboard'],
  fallbackFilters: 'vote_count > 2000 AND runtime > 0',
}

export type MediaBillboardSourceKind = 'rules' | 'curated' | 'fallback'

export interface MediaBillboardSource extends MediaQuerySpec {
  kind: MediaBillboardSourceKind
  /** Curated only: the config order the results have to be re-sorted into. */
  objectIDs?: string[]
}

export const DEFAULT_BILLBOARD_LIMIT = 5

const MIN_BILLBOARD_HITS = 20
const BILLBOARD_OVERFETCH_FACTOR = 4

export const getBillboardLimit = (
  billboard: MediaBillboardQuery = BILLBOARD_QUERY,
): number => billboard.limit ?? DEFAULT_BILLBOARD_LIMIT

export const resolveBillboardSource = (
  billboard: MediaBillboardQuery = BILLBOARD_QUERY,
): MediaBillboardSource[] => {
  const overfetchHits = Math.max(
    getBillboardLimit(billboard) * BILLBOARD_OVERFETCH_FACTOR,
    MIN_BILLBOARD_HITS,
  )

  const sources: MediaBillboardSource[] = []

  if (billboard.ruleContexts?.length) {
    sources.push({
      kind: 'rules',
      ruleContexts: billboard.ruleContexts,
      hitsPerPage: overfetchHits,
    })
  }

  if (billboard.objectIDs?.length) {
    sources.push({
      kind: 'curated',
      objectIDs: [...billboard.objectIDs],
      filters: billboard.objectIDs.map(getObjectIdFilter).join(' OR '),
      hitsPerPage: billboard.objectIDs.length,
    })
  }

  sources.push({
    kind: 'fallback',
    ...(billboard.fallbackFilters
      ? { filters: billboard.fallbackFilters }
      : {}),
    hitsPerPage: overfetchHits,
  })

  return sources
}

interface PickBillboardCandidatesArgs<T> {
  /** Extracted hit values, in source precedence order. */
  candidates: readonly T[]
  limit?: number
  /** Curated objectIDs in config order; they outrank the completeness score. */
  order?: readonly string[]
}

interface ScoredCandidate<T> {
  candidate: T
  curatedRank: number
  score: number
  index: number
}

/**
 * Hard drop: without any of these the hero renders visibly broken, so a missing
 * one disqualifies the candidate outright.
 */
const isRenderable = (candidate: MediaEntertainmentTitleHitValues): boolean =>
  Boolean(candidate.backdrop) &&
  Boolean(candidate.title) &&
  Boolean(candidate.tagline || candidate.overview) &&
  Boolean(candidate.genres?.length)

const scoreCandidate = (candidate: MediaEntertainmentTitleHitValues): number =>
  (candidate.maturityRating ? 1 : 0) +
  ((candidate.runtime ?? 0) > 0 ? 1 : 0) +
  (candidate.releaseYear ? 1 : 0)

export const pickBillboardCandidates = <
  T extends MediaEntertainmentTitleHitValues,
>({
  candidates,
  limit = DEFAULT_BILLBOARD_LIMIT,
  order,
}: PickBillboardCandidatesArgs<T>): T[] => {
  const seenObjectIDs = new Set<string>()
  const scored: ScoredCandidate<T>[] = []

  candidates.forEach((candidate, index) => {
    if (!isRenderable(candidate)) return
    if (seenObjectIDs.has(candidate.objectID)) return
    seenObjectIDs.add(candidate.objectID)

    const curatedIndex = order ? order.indexOf(candidate.objectID) : -1

    scored.push({
      candidate,
      curatedRank: curatedIndex === -1 ? (order?.length ?? 0) : curatedIndex,
      score: scoreCandidate(candidate),
      index,
    })
  })

  return scored
    .sort(
      (a, b) =>
        a.curatedRank - b.curatedRank || b.score - a.score || a.index - b.index,
    )
    .slice(0, limit)
    .map((entry) => entry.candidate)
}
