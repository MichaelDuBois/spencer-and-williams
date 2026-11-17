import { describe, expect, it } from 'vitest'

import { formatPlaybackTimestamp } from '@/app/travel/podcast/[id]/_utils/formatPlaybackTimestamp'

describe('formatPlaybackTimestamp', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatPlaybackTimestamp(65000)).toBe('1:05')
  })

  it('pads seconds to two digits', () => {
    expect(formatPlaybackTimestamp(9000)).toBe('0:09')
  })

  it('formats hour-long durations as h:mm:ss', () => {
    expect(formatPlaybackTimestamp(3661000)).toBe('1:01:01')
  })

  it('clamps negative values to zero', () => {
    expect(formatPlaybackTimestamp(-5000)).toBe('0:00')
  })

  it('floors fractional seconds', () => {
    expect(formatPlaybackTimestamp(1999)).toBe('0:01')
  })
})
