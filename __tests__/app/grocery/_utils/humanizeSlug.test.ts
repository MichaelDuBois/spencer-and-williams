import { describe, expect, it } from 'vitest'

import { humanizeSlug } from '@/app/grocery/_utils/humanizeSlug'

describe('humanizeSlug', () => {
  it('replaces underscores with spaces', () => {
    expect(humanizeSlug('ditalini_pasta')).toBe('ditalini pasta')
    expect(humanizeSlug('parmesan_cheese')).toBe('parmesan cheese')
  })

  it('leaves values without underscores unchanged', () => {
    expect(humanizeSlug('tomatoes')).toBe('tomatoes')
  })

  it('trims surrounding whitespace', () => {
    expect(humanizeSlug('  honey  ')).toBe('honey')
  })
})
