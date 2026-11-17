import { describe, expect, it } from 'vitest'

import { formatRuntime } from '@/app/media-entertainment/_utils/formatRuntime'

describe('formatRuntime', () => {
  it('returns null for 0 so "0m" can never render', () => {
    expect(formatRuntime(0)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(formatRuntime(undefined)).toBeNull()
  })

  it('returns null for null and for a negative runtime', () => {
    expect(formatRuntime(null)).toBeNull()
    expect(formatRuntime(-5)).toBeNull()
  })

  it('formats hours and minutes', () => {
    expect(formatRuntime(142)).toBe('2h 22m')
  })

  it('formats a sub-hour runtime as minutes only', () => {
    expect(formatRuntime(45)).toBe('45m')
  })

  it('omits the minutes on a whole number of hours', () => {
    expect(formatRuntime(120)).toBe('2h')
  })

  it('formats a single minute and a single hour', () => {
    expect(formatRuntime(1)).toBe('1m')
    expect(formatRuntime(60)).toBe('1h')
    expect(formatRuntime(61)).toBe('1h 1m')
  })
})
