import { describe, it, expect } from 'vitest'

import { parseColorFilterGroup } from '@/utilities/parseColorFilterGroup'

describe('parseColorFilterGroup', () => {
  it('parses a well-formed "name;hex" string', () => {
    expect(parseColorFilterGroup('teal;#008080')).toEqual({
      name: 'teal',
      hex: '#008080',
    })
  })

  it('uses colorMap hex when the name is mapped (overrides parsed hex)', () => {
    expect(parseColorFilterGroup('black;#999999')).toEqual({
      name: 'black',
      hex: '#000000',
    })
  })

  it('matches colorMap keys case-insensitively (lowercased lookup)', () => {
    expect(parseColorFilterGroup('Black;#999999')).toEqual({
      name: 'Black',
      hex: '#000000',
    })
  })

  it('falls back to parsed hex when name is not in colorMap', () => {
    expect(parseColorFilterGroup('not-a-real-color;#abcdef')).toEqual({
      name: 'not-a-real-color',
      hex: '#abcdef',
    })
  })

  it('returns null when the name is empty', () => {
    expect(parseColorFilterGroup(';#000000')).toBeNull()
  })

  it('returns null when there is no hex and no colorMap entry', () => {
    expect(parseColorFilterGroup('not-a-real-color')).toBeNull()
    expect(parseColorFilterGroup('not-a-real-color;')).toBeNull()
  })

  it('returns null for an empty input', () => {
    expect(parseColorFilterGroup('')).toBeNull()
  })
})
