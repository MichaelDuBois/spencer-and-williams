import { describe, expect, it } from 'vitest'

import { isMapRoute } from '@/lib/routes'

describe('isMapRoute', () => {
  it('matches known map routes', () => {
    expect(isMapRoute('/travel/map')).toBe(true)
    expect(isMapRoute('/fashion/stores')).toBe(true)
    expect(isMapRoute('/ecommerce/stores')).toBe(true)
  })

  it('matches child routes under a map segment', () => {
    expect(isMapRoute('/travel/map/123')).toBe(true)
    expect(isMapRoute('/fashion/stores/new-york')).toBe(true)
  })

  it('matches future verticals that adopt the same path segments', () => {
    expect(isMapRoute('/b2b-content/map')).toBe(true)
    expect(isMapRoute('/some-future-vertical/stores')).toBe(true)
  })

  it('does not match segments that merely share a prefix', () => {
    expect(isMapRoute('/travel/maps')).toBe(false)
    expect(isMapRoute('/fashion/storesfoo')).toBe(false)
  })

  it('does not match map/stores appearing inside another segment', () => {
    expect(isMapRoute('/travel/article/maps-and-routes')).toBe(false)
    expect(isMapRoute('/ecommerce/product/storefront')).toBe(false)
  })

  it('does not match non-map routes', () => {
    expect(isMapRoute('/travel')).toBe(false)
    expect(isMapRoute('/travel/search')).toBe(false)
    expect(isMapRoute('/travel/article/123')).toBe(false)
    expect(isMapRoute('/fashion')).toBe(false)
    expect(isMapRoute('/fashion/product/abc')).toBe(false)
    expect(isMapRoute('/ecommerce')).toBe(false)
    expect(isMapRoute('/ecommerce/search')).toBe(false)
    expect(isMapRoute('/b2b-content')).toBe(false)
    expect(isMapRoute('/')).toBe(false)
  })
})
