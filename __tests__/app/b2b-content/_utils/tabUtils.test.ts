import { describe, expect, it } from 'vitest'

import { tabHref, tabLabel } from '@/app/b2b-content/_utils/tabUtils'

describe('tabHref', () => {
  it('points the "all" tab at the base search route', () => {
    expect(tabHref('all')).toBe('/b2b-content/search')
  })

  it('appends the index key for a specific tab', () => {
    expect(tabHref('articles')).toBe('/b2b-content/search/articles')
  })
})

describe('tabLabel', () => {
  it('capitalizes the first letter of the key', () => {
    expect(tabLabel('all')).toBe('All')
    expect(tabLabel('blogs')).toBe('Blogs')
  })
})
