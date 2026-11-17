import { describe, expect, it } from 'vitest'

import {
  getActivityHitValues,
  getArticleHitValues,
  getPodcastHitValues,
} from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'

const slug = 'travel'
const articleTemplate = travelConfig.algolia.primaryIndex.template!
const podcastTemplate = travelConfig.algolia.indices.podcasts.template!
const activityTemplate = travelConfig.algolia.indices.activities.template!

describe('getTravelHitValues — product URLs', () => {
  it('builds article, podcast, and activity URLs from the objectID', () => {
    expect(
      getArticleHitValues({ objectID: 'A1' }, articleTemplate, slug).productUrl,
    ).toBe('/travel/article/A1')
    expect(
      getPodcastHitValues({ objectID: 'P1' }, podcastTemplate, slug).productUrl,
    ).toBe('/travel/podcast/P1')
    expect(
      getActivityHitValues({ objectID: 'AC1' }, activityTemplate, slug)
        .productUrl,
    ).toBe('/travel/activity/AC1')
  })
})

describe('getArticleHitValues — location', () => {
  it('joins country and region from an object location', () => {
    const hit = { objectID: 'A1', location: { country: 'France', region: 'Paris' } }
    expect(getArticleHitValues(hit, articleTemplate, slug).location).toBe(
      'France, Paris',
    )
  })

  it('passes through a string location', () => {
    const hit = { objectID: 'A1', location: 'Tokyo' }
    expect(getArticleHitValues(hit, articleTemplate, slug).location).toBe(
      'Tokyo',
    )
  })

  it('is undefined when the location is absent', () => {
    expect(
      getArticleHitValues({ objectID: 'A1' }, articleTemplate, slug).location,
    ).toBeUndefined()
  })
})
