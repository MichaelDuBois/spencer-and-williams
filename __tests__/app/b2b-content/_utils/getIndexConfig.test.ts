import { describe, expect, it } from 'vitest'

import { getIndexConfig } from '@/app/b2b-content/_utils/getIndexConfig'

describe('getIndexConfig', () => {
  it('returns the primary index for the documentation key', () => {
    expect(getIndexConfig('documentation').name).toBe(
      'documentation_algolia_2025',
    )
  })

  it('returns the matching secondary index for other keys', () => {
    expect(getIndexConfig('articles').name).toBe('documentation_zendesk_2025')
    expect(getIndexConfig('blogs').name).toBe('documentation_blogs_2026')
    expect(getIndexConfig('resources').name).toBe('documentation_resource_2026')
  })
})
