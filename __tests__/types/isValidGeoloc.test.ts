import { describe, expect, it } from 'vitest'

import { isValidGeoloc } from '@/types/location.types'

describe('isValidGeoloc', () => {
  it('returns false when geoloc is undefined', () => {
    expect(isValidGeoloc(undefined)).toBe(false)
  })

  it('returns false when lat is NaN', () => {
    expect(isValidGeoloc({ lat: Number.NaN, lng: 44.43 })).toBe(false)
  })

  it('returns false when lng is NaN', () => {
    expect(isValidGeoloc({ lat: 33.5, lng: Number.NaN })).toBe(false)
  })

  it('returns false when lat is not finite', () => {
    expect(isValidGeoloc({ lat: Infinity, lng: 0 })).toBe(false)
  })

  it('returns false when lng is not finite', () => {
    expect(isValidGeoloc({ lat: 0, lng: -Infinity })).toBe(false)
  })

  it('returns true for finite numeric coordinates', () => {
    expect(isValidGeoloc({ lat: 33.5, lng: 44.43 })).toBe(true)
  })

  it('returns true for zero coordinates', () => {
    expect(isValidGeoloc({ lat: 0, lng: 0 })).toBe(true)
  })
})
