import { describe, expect, it } from 'vitest'

import {
  getBillboardAttributes,
  getDetailAttributes,
  getRailAttributes,
} from '@/app/media-entertainment/_utils/titleAttributes'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaEntertainmentHitTemplate } from '@/app/media-entertainment/types'

const configuredTemplate = mediaEntertainmentConfig.algolia.primaryIndex
  .template as MediaEntertainmentHitTemplate

const renamedTemplate: MediaEntertainmentHitTemplate = {
  ...configuredTemplate,
  attributes: {
    ...configuredTemplate.attributes,
    poster: 'artwork.poster',
    rating: 'score',
  },
}

describe('title attribute sets', () => {
  it('resolves the rail set to the index names the config maps', () => {
    expect(getRailAttributes(configuredTemplate)).toEqual([
      'objectID',
      'title',
      'record_type',
      'genres',
      'release_date_str',
      'runtime',
      'certification',
      'poster_path',
      'backdrop_path',
      'vote_average',
    ])
  })

  it('follows the template when an attribute is renamed', () => {
    const attributes = getRailAttributes(renamedTemplate)

    expect(attributes).toContain('artwork.poster')
    expect(attributes).toContain('score')
    expect(attributes).not.toContain('poster_path')
    expect(attributes).not.toContain('vote_average')
  })

  it('gives the billboard the rail attributes plus the copy fields', () => {
    expect(getBillboardAttributes(configuredTemplate)).toEqual([
      ...getRailAttributes(configuredTemplate),
      'tagline',
      'overview',
    ])
  })

  // The seasons array is the heaviest attribute on a show record, and only the
  // sheet renders it.
  it('keeps seasons out of the rail and billboard payloads', () => {
    expect(getDetailAttributes(configuredTemplate)).toContain('seasons')
    expect(getRailAttributes(configuredTemplate)).not.toContain('seasons')
    expect(getBillboardAttributes(configuredTemplate)).not.toContain('seasons')
  })

  it('requests an attribute once when two keys map to it', () => {
    const attributes = getRailAttributes({
      ...configuredTemplate,
      attributes: { ...configuredTemplate.attributes, backdrop: 'poster_path' },
    })

    expect(
      attributes.filter((attribute) => attribute === 'poster_path'),
    ).toHaveLength(1)
  })
})
