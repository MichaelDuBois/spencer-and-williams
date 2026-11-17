import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRankingBadges } from '@/hooks/useRankingBadges'

const usePersonalizationMock = vi.fn()
const COMPOSITION_ID = 'test-composition'

vi.mock('@/hooks/usePersonalization', () => {return {
  usePersonalization: () => usePersonalizationMock(),
}})

vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => {return {
    features: { composition:  { compositionId: COMPOSITION_ID } },
  }},
}})

const setMode = (
  mode: 'anonymous' | 'persona' | 'realtime',
  currentOptionalFilters: string[] = [],
) => {
  usePersonalizationMock.mockReturnValue({
    mode,
    currentUserToken: '',
    currentOptionalFilters,
  })
}

const makeItem = ({
  composed,
  filtersScore,
  filters,
  extra,
  brand,
}: {
  composed?: boolean | { injectedItemKey?: string }
  filtersScore?: number
  filters?: number
  extra?: unknown
  brand?: string
} = {}): Record<string, unknown> => {return {
  objectID: 'p1',
  ...(brand !== undefined && { brand }),
  ...(extra !== undefined && { _extra: extra }),
  _rankingInfo: {
    ...(composed !== undefined && {
      composed: { [COMPOSITION_ID]: composed },
    }),
    ...(filtersScore !== undefined && {
      personalization: { filtersScore },
    }),
    ...(filters !== undefined && { filters }),
  },
}}

describe('useRankingBadges', () => {
  it('returns both false when item has no ranking info', () => {
    setMode('persona')
    const { result } = renderHook(() => useRankingBadges({ objectID: 'p1' }))

    expect(result.current).toEqual({
      isComposed: false,
      isPersonalized: false,
      isSponsored: false,
      composedLabel: 'Promoted',
    })
  })

  it('returns isComposed true when ranking info has composed flag', () => {
    setMode('anonymous')
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ composed: true })),
    )

    expect(result.current.isComposed).toBe(true)
  })

  it('derives composedLabel from the injected item key prefix', () => {
    setMode('persona')
    const { result } = renderHook(() =>
      useRankingBadges(
        makeItem({ composed: { injectedItemKey: 'sponsored-42' } }),
      ),
    )

    expect(result.current.isComposed).toBe(true)
    expect(result.current.composedLabel).toBe('Sponsored')
  })

  it('returns isPersonalized false for anonymous mode even with a positive filtersScore', () => {
    setMode('anonymous')
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ filtersScore: 5 })),
    )

    expect(result.current.isPersonalized).toBe(false)
  })

  it('returns isPersonalized true for persona mode with a positive filtersScore', () => {
    setMode('persona')
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ filtersScore: 3 })),
    )

    expect(result.current.isPersonalized).toBe(true)
  })

  it('returns isPersonalized true for realtime mode with a positive filtersScore', () => {
    setMode('realtime')
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ filtersScore: 1 })),
    )

    expect(result.current.isPersonalized).toBe(true)
  })

  it('returns isPersonalized false for persona mode with zero filtersScore', () => {
    setMode('persona')
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ filtersScore: 0 })),
    )

    expect(result.current.isPersonalized).toBe(false)
  })

  it('returns isPersonalized false when the top-level filters score only reflects a hard filter', () => {
    setMode('persona', ['brand:Niman Ranch<score=10>'])
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ filters: 1, brand: 'Generic Farms' })),
    )

    expect(result.current.isPersonalized).toBe(false)
  })

  it('returns isPersonalized true when the hit matches an active optional filter', () => {
    setMode('persona', ['brand:Niman Ranch<score=10>'])
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ filters: 11, brand: 'Niman Ranch' })),
    )

    expect(result.current.isPersonalized).toBe(true)
  })

  it('returns isPersonalized true for realtime mode when the hit matches a realtime affinity', () => {
    setMode('realtime', ['brand:Horizon Organic<score=10>'])
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ brand: 'Horizon Organic' })),
    )

    expect(result.current.isPersonalized).toBe(true)
  })

  it('returns isPersonalized false for anonymous mode even when the hit matches an optional filter', () => {
    setMode('anonymous', ['brand:Niman Ranch<score=10>'])
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ filters: 11, brand: 'Niman Ranch' })),
    )

    expect(result.current.isPersonalized).toBe(false)
  })

  it('returns both true when composed and personalized for a persona user', () => {
    setMode('persona')
    const { result } = renderHook(() =>
      useRankingBadges(makeItem({ composed: true, filtersScore: 10 })),
    )

    expect(result.current).toEqual({
      isComposed: true,
      isPersonalized: true,
      isSponsored: false,
      composedLabel: 'Promoted',
    })
  })

  describe('external source (retail media) hits', () => {
    const EXTRA = {
      beacons: [{ type: 'impression', url: 'https://ads.example/imp' }],
      campaign_id: 1963552,
    }

    it('flags a composed hit carrying _extra as sponsored, overriding the prefix label', () => {
      setMode('anonymous')
      const { result } = renderHook(() =>
        useRankingBadges(
          makeItem({
            composed: { injectedItemKey: 'popular_x' },
            extra: EXTRA,
          }),
        ),
      )

      expect(result.current.isComposed).toBe(true)
      expect(result.current.isSponsored).toBe(true)
      expect(result.current.composedLabel).toBe('Sponsored')
    })

    it('keeps an internally injected hit without _extra as non-sponsored with its prefix label', () => {
      setMode('anonymous')
      const { result } = renderHook(() =>
        useRankingBadges(
          makeItem({ composed: { injectedItemKey: 'popular-picks' } }),
        ),
      )

      expect(result.current.isComposed).toBe(true)
      expect(result.current.isSponsored).toBe(false)
      expect(result.current.composedLabel).toBe('Popular')
    })

    it('does not flag an organic hit with a stray _extra as sponsored', () => {
      setMode('anonymous')
      const { result } = renderHook(() =>
        useRankingBadges(makeItem({ extra: EXTRA })),
      )

      expect(result.current.isComposed).toBe(false)
      expect(result.current.isSponsored).toBe(false)
    })

    it('ignores a non-object _extra on a composed hit', () => {
      setMode('anonymous')
      const { result } = renderHook(() =>
        useRankingBadges(makeItem({ composed: true, extra: null })),
      )

      expect(result.current.isSponsored).toBe(false)
    })
  })
})
