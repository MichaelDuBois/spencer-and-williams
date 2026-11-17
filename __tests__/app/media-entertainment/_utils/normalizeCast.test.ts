import { describe, expect, it } from 'vitest'

import { normalizeCast } from '@/app/media-entertainment/_utils/normalizeCast'

const PREFIX = 'https://image.tmdb.org/t/p/w500'

describe('normalizeCast', () => {
  it('keeps name, character and portrait and drops the facet payload', () => {
    const raw = [
      {
        name: 'Millie Bobby Brown',
        character: 'Eleven',
        profile_path: '/mbb.jpg',
        facet: 'Millie Bobby Brown||/mbb.jpg',
      },
    ]

    expect(normalizeCast(raw, PREFIX)).toEqual([
      {
        name: 'Millie Bobby Brown',
        character: 'Eleven',
        profileImage: `${PREFIX}/mbb.jpg`,
      },
    ])
  })

  it('omits the portrait when TMDB has no profile path', () => {
    const [member] = normalizeCast([{ name: 'Uncredited' }], PREFIX) ?? []

    expect(member).toEqual({ name: 'Uncredited' })
  })

  it('drops entries with no usable name', () => {
    expect(normalizeCast([{ character: 'Eleven' }, 'nope', null], PREFIX))
      .toBeUndefined()
  })

  it('returns undefined for anything that is not an array', () => {
    expect(normalizeCast(undefined, PREFIX)).toBeUndefined()
    expect(normalizeCast('Robert Downey Jr.', PREFIX)).toBeUndefined()
  })
})
