import { describe, expect, it } from 'vitest'

import {
  formatTimeUntil,
  getNextStagingSync,
  getTimeUntilNextStagingSync,
} from '@/lib/staging-sync-schedule'

const utc = (
  hours: number,
  minutes = 0,
  seconds = 0,
  day = 12,
): Date => new Date(Date.UTC(2026, 8, day, hours, minutes, seconds))

describe('getNextStagingSync', () => {
  it('advances to the next three-hour boundary', () => {
    expect(getNextStagingSync(utc(1, 30)).toISOString()).toBe(
      '2026-09-12T03:00:00.000Z',
    )
  })

  it('skips past a boundary landed on exactly', () => {
    expect(getNextStagingSync(utc(3)).toISOString()).toBe(
      '2026-09-12T06:00:00.000Z',
    )
  })

  it('treats midnight as a boundary', () => {
    expect(getNextStagingSync(utc(0)).toISOString()).toBe(
      '2026-09-12T03:00:00.000Z',
    )
  })

  it('rolls into the next day after the last window', () => {
    expect(getNextStagingSync(utc(23, 59)).toISOString()).toBe(
      '2026-09-13T00:00:00.000Z',
    )
  })

  it('discards minutes, seconds and milliseconds', () => {
    const next = getNextStagingSync(utc(7, 42, 13))

    expect(next.getUTCMinutes()).toBe(0)
    expect(next.getUTCSeconds()).toBe(0)
    expect(next.getUTCMilliseconds()).toBe(0)
    expect(next.getUTCHours()).toBe(9)
  })

  it('does not mutate the date it is given', () => {
    const now = utc(4, 20)
    getNextStagingSync(now)

    expect(now.toISOString()).toBe('2026-09-12T04:20:00.000Z')
  })
})

describe('formatTimeUntil', () => {
  it('omits hours under an hour', () => {
    expect(formatTimeUntil(utc(2, 30), utc(3))).toBe('30m')
  })

  it('omits minutes on a whole hour', () => {
    expect(formatTimeUntil(utc(2), utc(3))).toBe('1h')
  })

  it('reports both parts otherwise', () => {
    expect(formatTimeUntil(utc(1, 30), utc(3))).toBe('1h 30m')
  })

  it('rounds a partial minute up rather than to zero', () => {
    expect(formatTimeUntil(utc(2, 59, 30), utc(3))).toBe('1m')
  })

  it('floors a past target at zero', () => {
    expect(formatTimeUntil(utc(4), utc(3))).toBe('0m')
  })
})

describe('getTimeUntilNextStagingSync', () => {
  it('measures the wait to the next boundary', () => {
    expect(getTimeUntilNextStagingSync(utc(13, 15))).toBe('1h 45m')
  })

  it('measures across the midnight rollover', () => {
    expect(getTimeUntilNextStagingSync(utc(22))).toBe('2h')
  })

  it('never exceeds the sync interval', () => {
    expect(getTimeUntilNextStagingSync(utc(3, 0, 1))).toBe('3h')
  })
})
