import { describe, expect, it } from 'vitest'

import {
  formatRating,
  formatVoteCount,
} from '@/app/media-entertainment/_utils/formatVotes'

describe('formatRating', () => {
  it('renders one decimal', () => {
    expect(formatRating(7.876)).toBe('7.9')
    expect(formatRating(8)).toBe('8.0')
  })

  it('treats an unrated title as having no rating', () => {
    expect(formatRating(0)).toBeNull()
    expect(formatRating(undefined)).toBeNull()
  })
})

describe('formatVoteCount', () => {
  it('groups thousands', () => {
    expect(formatVoteCount(19561)).toBe('19,561')
  })

  it('returns nothing for no votes', () => {
    expect(formatVoteCount(0)).toBeNull()
    expect(formatVoteCount(undefined)).toBeNull()
  })
})
