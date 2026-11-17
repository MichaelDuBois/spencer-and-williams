import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useFindDestinationBounds } from '@/app/travel/_hooks/useFindDestinationBounds'
import type {
  ActivityHitValues,
  ArticleHitValues,
} from '@/app/travel/hitValues.types'

const article = (lat: number, lng: number): ArticleHitValues => {return {
  objectID: 'art',
  productUrl: '',
  title: 'Article',
  _geoloc: { lat, lng },
}}

const activity = (
  id: string,
  geo: { lat: number; lng: number } | undefined,
): ActivityHitValues => {return {
  objectID: id,
  productUrl: '',
  title: id,
  _geoloc: geo,
}}

describe('useFindDestinationBounds', () => {
  it('returns undefined when there is no article', () => {
    const { result } = renderHook(() =>
      useFindDestinationBounds(undefined, [activity('a', { lat: 1, lng: 2 })]),
    )
    expect(result.current).toBeUndefined()
  })

  it('returns undefined when only one valid point exists', () => {
    const { result } = renderHook(() =>
      useFindDestinationBounds(article(10, 20), []),
    )
    expect(result.current).toBeUndefined()
  })

  it('filters out activities whose geoloc is invalid', () => {
    const { result } = renderHook(() =>
      useFindDestinationBounds(article(10, 20), [
        activity('a', { lat: Number.NaN, lng: 30 }),
        activity('b', undefined),
      ]),
    )
    expect(result.current).toBeUndefined()
  })

  it('squares a lng-dominant input at the equator by expanding lat, then applies 25% buffer', () => {
    const { result } = renderHook(() =>
      useFindDestinationBounds(article(0, 0), [activity('a', { lat: 0, lng: 10 })]),
    )
    expect(result.current).toBeDefined()
    const [sw, ne] = result.current!
    expect(sw.lat).toBeCloseTo(-6.25, 5)
    expect(ne.lat).toBeCloseTo(6.25, 5)
    expect(sw.lng).toBeCloseTo(-1.25, 5)
    expect(ne.lng).toBeCloseTo(11.25, 5)
  })

  it('squares a lat-dominant input centered on the equator by expanding lng, then applies 25% buffer', () => {
    const { result } = renderHook(() =>
      useFindDestinationBounds(article(-5, 0), [activity('a', { lat: 5, lng: 0 })]),
    )
    expect(result.current).toBeDefined()
    const [sw, ne] = result.current!
    expect(sw.lat).toBeCloseTo(-6.25, 5)
    expect(ne.lat).toBeCloseTo(6.25, 5)
    expect(sw.lng).toBeCloseTo(-6.25, 5)
    expect(ne.lng).toBeCloseTo(6.25, 5)
  })

  it('clamps to lat ±85 and lng ±180 when the buffered box overshoots', () => {
    const { result } = renderHook(() =>
      useFindDestinationBounds(article(84, 175), [
        activity('a', { lat: -84, lng: -175 }),
      ]),
    )
    expect(result.current).toBeDefined()
    const [sw, ne] = result.current!
    for (const c of [sw, ne]) {
      expect(c.lat).toBeGreaterThanOrEqual(-85)
      expect(c.lat).toBeLessThanOrEqual(85)
      expect(c.lng).toBeGreaterThanOrEqual(-180)
      expect(c.lng).toBeLessThanOrEqual(180)
    }
  })
})
