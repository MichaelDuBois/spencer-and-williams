import { describe, expect, it } from 'vitest'

import { getElectronicsSpecs } from '@/app/electronics/_utils/getElectronicsSpecs'
import type { ElectronicsProductHitValues } from '@/app/electronics/hitValues.types'

const makeProduct = (
  overrides: Partial<ElectronicsProductHitValues> = {},
): ElectronicsProductHitValues =>
  ({
    objectID: '1',
    productUrl: '/electronics/product/1',
    name: 'Test Device',
    ...overrides,
  }) as ElectronicsProductHitValues

describe('getElectronicsSpecs', () => {
  it('builds rows in a stable order and drops missing specs', () => {
    const rows = getElectronicsSpecs(
      makeProduct({
        cpu: 'Celeron N3350',
        ram: '4 GB',
        storage: '64 GB',
        screenSize: '13.3 Inches',
        os: 'Windows 10',
      }),
    )

    expect(rows).toEqual([
      { label: 'Processor', value: 'Celeron N3350' },
      { label: 'Memory (RAM)', value: '4 GB' },
      { label: 'Storage', value: '64 GB' },
      { label: 'Screen Size', value: '13.3 Inches' },
      { label: 'Operating System', value: 'Windows 10' },
    ])
  })

  it('falls back to hard disk size when storage capacity is absent', () => {
    const rows = getElectronicsSpecs(makeProduct({ hardDiskSize: '256 GB' }))

    expect(rows).toContainEqual({ label: 'Storage', value: '256 GB' })
  })

  it('prefers memory storage capacity over hard disk size', () => {
    const rows = getElectronicsSpecs(
      makeProduct({ storage: '512 GB', hardDiskSize: '256 GB' }),
    )

    expect(rows).toContainEqual({ label: 'Storage', value: '512 GB' })
  })

  it('returns an empty array when no specs are present', () => {
    expect(getElectronicsSpecs(makeProduct())).toEqual([])
  })
})
