import { describe, expect, it } from 'vitest'

import { formatDate } from '@/utilities/formatDate'

describe('formatDate', () => {
  it('formats ISO date strings', () => {
    expect(formatDate('2024-01-15T12:00:00')).toBe('Jan 15, 2024')
  })

  it('formats millisecond timestamps', () => {
    expect(formatDate(new Date(2024, 0, 15, 12).getTime())).toBe(
      'Jan 15, 2024',
    )
  })

  it('returns null for invalid values', () => {
    expect(formatDate('not-a-date')).toBeNull()
    expect(formatDate('')).toBeNull()
    expect(formatDate(null)).toBeNull()
    expect(formatDate(undefined)).toBeNull()
  })
})
