import { getFurnishingSpecs } from '@/app/furnishing/_utils/getFurnishingSpecs'
import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'

interface FurnishingSpecsProps {
  product: FurnishingProductHitValues
}

export const FurnishingSpecs = ({ product }: FurnishingSpecsProps) => {
  const rows = getFurnishingSpecs(product)

  if (rows.length === 0) return null

  return (
    <dl className="divide-border divide-y">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-4 py-1.5">
          <dt>{label}</dt>
          <dd className="text-foreground text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
