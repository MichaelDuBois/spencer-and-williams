import { describe, expect, it } from 'vitest'

import { buildSpecRows } from '@/utilities/buildSpecRows'

describe('buildSpecRows', () => {
  it('keeps pairs that have a value, in the order given', () => {
    expect(
      buildSpecRows([
        { label: 'Processor', value: 'M4' },
        { label: 'Memory (RAM)', value: '16GB' },
      ]),
    ).toEqual([
      { label: 'Processor', value: 'M4' },
      { label: 'Memory (RAM)', value: '16GB' },
    ])
  })

  it('drops pairs whose value is undefined', () => {
    expect(
      buildSpecRows([
        { label: 'Processor', value: 'M4' },
        { label: 'Graphics', value: undefined },
        { label: 'Color', value: 'Silver' },
      ]),
    ).toEqual([
      { label: 'Processor', value: 'M4' },
      { label: 'Color', value: 'Silver' },
    ])
  })

  it('drops pairs whose value is an empty string', () => {
    expect(buildSpecRows([{ label: 'Storage', value: '' }])).toEqual([])
  })

  it('returns an empty array when nothing has a value', () => {
    expect(
      buildSpecRows([
        { label: 'Processor', value: undefined },
        { label: 'Graphics', value: undefined },
      ]),
    ).toEqual([])
  })

  it('returns an empty array for no pairs', () => {
    expect(buildSpecRows([])).toEqual([])
  })
})
