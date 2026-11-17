import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'

export interface B2BWarehouseSpecRow {
  label: string
  value: string
}

export const getB2BWarehouseSpecs = (
  product: B2BWarehouseProductHitValues,
): B2BWarehouseSpecRow[] =>
  Object.entries(product.info ?? {})
    .map(([label, value]) => {
      return { label, value: value.trim() }
    })
    .filter((row): row is B2BWarehouseSpecRow => row.value.length > 0)
