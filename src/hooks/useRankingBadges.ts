'use client'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { usePersonalization } from '@/hooks/usePersonalization'
import { getComposedLabel } from '@/utilities/getComposedLabel'
import { isRecord } from '@/utilities/isRecord'
import { matchesOptionalFilters } from '@/utilities/matchesOptionalFilters'

interface RankingBadges {
  isComposed: boolean
  isPersonalized: boolean
  /** Injected from an external source group (retail media), flagged by `_extra`. */
  isSponsored: boolean
  composedLabel: string
}

const SPONSORED_LABEL = 'Sponsored'

export const useRankingBadges = (
  item: Record<string, unknown>,
): RankingBadges => {
  const { mode, currentOptionalFilters } = usePersonalization()
  const config = useActiveConfig()

  const compositionId = config?.features.composition?.compositionId
  const rankingInfo = item._rankingInfo as Record<string, unknown> | undefined
  const composed = rankingInfo?.composed as Record<string, unknown> | undefined
  const composedEntry =
    compositionId && composed
      ? (composed[compositionId] as { injectedItemKey?: string } | undefined)
      : undefined
  const isComposed = !!composedEntry
  const isSponsored = isComposed && isRecord(item._extra)
  const composedLabel = isSponsored
    ? SPONSORED_LABEL
    : getComposedLabel(composedEntry?.injectedItemKey)

  const personalization = rankingInfo?.personalization as
    | { filtersScore?: number }
    | undefined
  // `_rankingInfo.filters` also counts hard filters (category pages, facet
  // refinements), so it can't tell a boosted hit from a filtered one.
  const isPersonalized =
    mode !== 'anonymous' &&
    ((personalization?.filtersScore ?? 0) > 0 ||
      matchesOptionalFilters(item, currentOptionalFilters))

  return { isComposed, isPersonalized, isSponsored, composedLabel }
}
