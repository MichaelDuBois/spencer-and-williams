import { describe, expect, it } from 'vitest'

import { buildTravelPodcastWaveformBars } from '@/app/travel/podcast/[id]/_utils/waveformLogic'

const transcript = [{ speaker: 'Host', text: 'the quick brown fox jumps' }]

describe('buildTravelPodcastWaveformBars', () => {
  it('returns an empty array when barCount is not positive', () => {
    expect(buildTravelPodcastWaveformBars({ transcript }, 0)).toEqual([])
  })

  it('returns exactly barCount bars', () => {
    expect(buildTravelPodcastWaveformBars({ transcript }, 12)).toHaveLength(12)
  })

  it('keeps every bar within the min/max height bounds', () => {
    const bars = buildTravelPodcastWaveformBars({ transcript }, 25)
    for (const height of bars) {
      expect(height).toBeGreaterThanOrEqual(0.18)
      expect(height).toBeLessThanOrEqual(0.96)
    }
  })

  it('limits the height delta between adjacent bars', () => {
    const bars = buildTravelPodcastWaveformBars({ transcript }, 25)
    for (let i = 1; i < bars.length; i++) {
      expect(Math.abs(bars[i] - bars[i - 1])).toBeLessThanOrEqual(0.3001)
    }
  })

  it('renders flat base-height bars when the transcript is empty', () => {
    const bars = buildTravelPodcastWaveformBars({ transcript: [] }, 5)
    expect(bars).toEqual([0.414, 0.414, 0.414, 0.414, 0.414])
  })
})
