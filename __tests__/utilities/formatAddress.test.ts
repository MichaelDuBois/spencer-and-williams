import { describe, expect, it } from 'vitest'

import { formatAddress } from '@/utilities/formatAddress'

describe('formatAddress', () => {
  it('splits a typical address on commas and trims each segment', () => {
    expect(
      formatAddress('123 Main St, College Park, GA 30337, USA'),
    ).toEqual(['123 Main St', 'College Park', 'GA 30337', 'USA'])
  })

  it('drops empty segments from trailing or consecutive commas', () => {
    expect(formatAddress('123 Main St,, USA,')).toEqual([
      '123 Main St',
      'USA',
    ])
  })

  it('returns a single-element array when there are no commas', () => {
    expect(formatAddress('Just a street name')).toEqual(['Just a street name'])
  })

  it('returns an empty array for an empty string', () => {
    expect(formatAddress('')).toEqual([])
  })
})
