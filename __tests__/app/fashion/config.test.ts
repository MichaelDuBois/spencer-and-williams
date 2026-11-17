import { describe, expect, it } from 'vitest'

import { fashionConfig } from '@/app/fashion/config'

describe('fashionConfig', () => {
  it('enables inline articles for the fashion vertical', () => {
    expect(fashionConfig.features.showInlineArticles).toBe(true)
  })
})
