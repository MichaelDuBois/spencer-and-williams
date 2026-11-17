import { describe, expect, it } from 'vitest'

import { getHierarchyBreadcrumb } from '@/app/b2b-content/_utils/getHierarchyBreadcrumb'

describe('getHierarchyBreadcrumb', () => {
  it('returns an empty array when hierarchy is missing', () => {
    expect(getHierarchyBreadcrumb()).toEqual([])
  })

  it('sorts hierarchy levels by numeric suffix', () => {
    const hierarchy = {
      lvl3: 'Advanced',
      lvl2: 'Guides',
      lvl1: 'Documentation',
    }

    expect(getHierarchyBreadcrumb(hierarchy)).toEqual([
      'Documentation',
      'Guides',
      'Advanced',
    ])
  })

  it('takes the last segment of each level and skips empty values', () => {
    const hierarchy = {
      lvl1: 'Documentation >  > Search',
      lvl2: '',
      category: 'Ignored',
    }

    expect(getHierarchyBreadcrumb(hierarchy)).toEqual(['Search'])
  })

  it('skips levels that contain only separators', () => {
    const hierarchy = {
      lvl1: 'Documentation',
      lvl2: ' > ',
      lvl3: 'Search',
    }

    expect(getHierarchyBreadcrumb(hierarchy)).toEqual([
      'Documentation',
      'Search',
    ])
  })
})
