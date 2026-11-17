import { describe, expect, it } from 'vitest'

import {
  GENRE_ROW,
  GENRE_ROW_POSITION,
  RECOMMEND_ROW,
  buildHomepageRows,
} from '@/app/media-entertainment/_utils/buildHomepageRows'
import { getBrowseRails } from '@/app/media-entertainment/_utils/recommendRail'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type {
  MediaHomepageRailConfig,
  MediaRail,
} from '@/app/media-entertainment/types'

import { createMediaRailItems } from '@tests/app/media-entertainment/_helpers/railFixtures'

const RECOMMEND_CONFIG: MediaHomepageRailConfig = {
  id: 'because-you-watched',
  source: 'recommend',
  title: 'Because you watched',
}

const browseConfig = (id: string): MediaHomepageRailConfig => {
  return { id, title: id }
}

const resolved = (id: string): MediaRail => {
  return { id, title: id, items: createMediaRailItems(1) }
}

/** Row ids, with the two self-fetching rows shown by their marker. */
const rowIds = (rows: ReturnType<typeof buildHomepageRows>) =>
  rows.map((row) => (typeof row === 'string' ? row : row.id))

describe('buildHomepageRows', () => {
  it('puts the Recommend row where config puts it', () => {
    const rows = buildHomepageRows({
      rails: [resolved('a'), resolved('b')],
      configuredRails: [browseConfig('a'), RECOMMEND_CONFIG, browseConfig('b')],
    })

    expect(rowIds(rows)).toEqual(['a', RECOMMEND_ROW, 'b'])
  })

  it('draws no Recommend row when none is configured', () => {
    const rows = buildHomepageRows({
      rails: [resolved('a'), resolved('b')],
      configuredRails: [browseConfig('a'), browseConfig('b')],
    })

    expect(rowIds(rows)).toEqual(['a', 'b'])
  })

  it('places the Recommend row first when it leads the config', () => {
    const rows = buildHomepageRows({
      rails: [resolved('a')],
      configuredRails: [RECOMMEND_CONFIG, browseConfig('a')],
    })

    expect(rowIds(rows)).toEqual([RECOMMEND_ROW, 'a'])
  })

  it('still draws the Recommend row when config puts it last', () => {
    const rows = buildHomepageRows({
      rails: [resolved('a')],
      configuredRails: [browseConfig('a'), RECOMMEND_CONFIG],
    })

    expect(rowIds(rows)).toEqual(['a', RECOMMEND_ROW])
  })

  // The position is counted in rails that survived, not in config entries, so a
  // rail whose rule returned nothing cannot push the row out of place.
  it('closes the gap left by a browse rail that resolved empty', () => {
    const rows = buildHomepageRows({
      rails: [resolved('b')],
      configuredRails: [browseConfig('a'), RECOMMEND_CONFIG, browseConfig('b')],
    })

    expect(rowIds(rows)).toEqual([RECOMMEND_ROW, 'b'])
  })

  it('breaks up the poster rails with the genre row', () => {
    const rails = ['a', 'b', 'c', 'd', 'e'].map(resolved)

    const rows = buildHomepageRows({
      rails,
      configuredRails: rails.map((rail) => browseConfig(rail.id)),
    })

    expect(rowIds(rows).indexOf(GENRE_ROW)).toBe(GENRE_ROW_POSITION)
  })

  it('leaves the genre row off a page with nothing after it', () => {
    const rails = ['a', 'b', 'c'].map(resolved)

    const rows = buildHomepageRows({
      rails,
      configuredRails: rails.map((rail) => browseConfig(rail.id)),
    })

    expect(rowIds(rows)).not.toContain(GENRE_ROW)
  })

  it('draws every configured browse rail exactly once', () => {
    const configuredRails = mediaEntertainmentConfig.homepageRails ?? []
    const rails = getBrowseRails(configuredRails).map((rail) =>
      resolved(rail.id),
    )

    const rows = buildHomepageRows({ rails, configuredRails })

    expect(rowIds(rows)).toEqual([
      'top-10',
      RECOMMEND_ROW,
      'new-releases',
      'sw-originals',
      GENRE_ROW,
      'blockbusters',
      'binge-series',
      'sci-fi',
      'family-night',
    ])
  })
})
