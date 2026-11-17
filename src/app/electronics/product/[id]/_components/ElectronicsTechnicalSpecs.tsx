import { getElectronicsSpecs } from '@/app/electronics/_utils/getElectronicsSpecs'
import type { ElectronicsProductHitValues } from '@/app/electronics/hitValues.types'

interface ElectronicsTechnicalSpecsProps {
  product: ElectronicsProductHitValues
}

export const ElectronicsTechnicalSpecs = ({
  product,
}: ElectronicsTechnicalSpecsProps) => {
  const rows = getElectronicsSpecs(product)

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
