import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'
import { buildSpecRows, type SpecRow } from '@/utilities/buildSpecRows'

export const getFurnishingSpecs = (
  product: FurnishingProductHitValues,
): SpecRow[] =>
  buildSpecRows([
    { label: 'Dimensions', value: product.dimensions },
    { label: 'Material', value: product.material },
    { label: 'Frame Material', value: product.frameMaterial },
    { label: 'Upholstery Fabric', value: product.upholsteryFabric },
    { label: 'Room Type', value: product.roomType },
    { label: 'Assembly Required', value: product.assemblyRequired },
    { label: 'Color', value: product.color },
  ])
