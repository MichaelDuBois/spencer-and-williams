import { beforeEach, describe, expect, it, vi } from 'vitest'

import { trackContentClick } from '@/lib/analytics/content-events'

const { trackMock } = vi.hoisted(() => {
  return { trackMock: vi.fn() }
})

vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

describe('trackContentClick', () => {
  beforeEach(() => {
    trackMock.mockClear()
  })

  it('sends the hit with its query attribution', () => {
    trackContentClick(
      { objectID: 'a1', __queryID: 'q1', __position: 3 },
      { contentType: 'article', index: 'travel_media_articles' },
    )

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('content_clicked', {
      objectID: 'a1',
      contentType: 'article',
      index: 'travel_media_articles',
      position: 3,
      queryID: 'q1',
    })
  })

  it('omits position and queryID when the hit carries neither', () => {
    trackContentClick(
      { objectID: 'b1' },
      { contentType: 'blog', index: 'documentation_blogs_2026' },
    )

    expect(trackMock).toHaveBeenCalledWith('content_clicked', {
      objectID: 'b1',
      contentType: 'blog',
      index: 'documentation_blogs_2026',
    })
    const properties = trackMock.mock.calls[0][1]
    expect(properties).not.toHaveProperty('position')
    expect(properties).not.toHaveProperty('queryID')
  })

  it('keeps a zero position', () => {
    trackContentClick(
      { objectID: 'p1', __position: 0 },
      { contentType: 'podcast', index: 'travel_media_podcasts' },
    )

    expect(trackMock.mock.calls[0][1]).toHaveProperty('position', 0)
  })
})
