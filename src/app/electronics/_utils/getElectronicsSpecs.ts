import type { ElectronicsProductHitValues } from '@/app/electronics/hitValues.types'
import { buildSpecRows, type SpecRow } from '@/utilities/buildSpecRows'

export const getElectronicsSpecs = (
  product: ElectronicsProductHitValues,
): SpecRow[] => {
  const storage = product.storage ?? product.hardDiskSize

  return buildSpecRows([
    { label: 'Processor', value: product.cpu },
    { label: 'Memory (RAM)', value: product.ram },
    { label: 'Storage', value: storage },
    { label: 'Graphics', value: product.graphics },
    { label: 'Screen Size', value: product.screenSize },
    { label: 'Operating System', value: product.os },
    { label: 'Color', value: product.color },
  ])
}
