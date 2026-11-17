import type { B2BWarehouseSpecRow } from '@/app/b2b-warehouse/_utils/getB2BWarehouseSpecs'

interface B2BWarehouseSpecsTableProps {
  rows: B2BWarehouseSpecRow[]
}

export const B2BWarehouseSpecsTable = ({
  rows,
}: B2BWarehouseSpecsTableProps) => (
  <dl className="divide-border divide-y">
    {rows.map(({ label, value }) => (
      <div key={label} className="flex justify-between gap-4 py-1.5">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="text-foreground text-right font-medium">{value}</dd>
      </div>
    ))}
  </dl>
)
