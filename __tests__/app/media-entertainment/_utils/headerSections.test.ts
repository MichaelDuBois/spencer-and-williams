import { describe, expect, it } from 'vitest'

import {
  HEADER_SECTIONS,
  getHeaderSection,
  getHeaderSectionParams,
} from '@/app/media-entertainment/_utils/headerSections'

describe('getHeaderSection', () => {
  it('resolves a configured section by its url segment', () => {
    expect(getHeaderSection('tv-series')?.title).toBe('TV Series')
  })

  it('returns undefined for an unknown or missing segment', () => {
    expect(getHeaderSection('documentaries')).toBeUndefined()
    expect(getHeaderSection(undefined)).toBeUndefined()
  })
})

describe('getHeaderSectionParams', () => {
  it('passes a section filter through verbatim', () => {
    const params = getHeaderSectionParams({
      id: 'movies',
      title: 'Movies',
      filters: 'record_type:movie',
    })

    expect(params).toEqual({ filters: 'record_type:movie' })
  })

  it('sends both context kinds as one ruleContexts list', () => {
    expect(
      getHeaderSectionParams({
        id: 'new-popular',
        title: 'New & Popular',
        filterRuleContexts: ['ctx_filter'],
        ruleContexts: ['ctx_pin'],
      }),
    ).toEqual({ ruleContexts: ['ctx_filter', 'ctx_pin'] })
  })

  it('omits keys it has no value for, so Configure cannot blank an inherited one', () => {
    expect(getHeaderSectionParams({ id: 'all', title: 'All' })).toEqual({})
  })
})

describe('configured browse sections', () => {
  it('hides the type chip wherever the section locks record_type', () => {
    const locked = HEADER_SECTIONS.filter((section) =>
      section.filters?.includes('record_type'),
    )

    expect(locked.length).toBeGreaterThan(0)
    for (const section of locked) {
      expect(section.hiddenFacets).toContain('record_type')
    }
  })

  it('gives every section a unique url segment', () => {
    const ids = HEADER_SECTIONS.map((section) => section.id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})
