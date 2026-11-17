import { Cpu, HardDrive, Monitor, ShieldCheck, Sparkles } from 'lucide-react'

import type { ElectronicsProductHitValues } from '@/app/electronics/hitValues.types'
import { cn } from '@/lib/utils'

interface ElectronicsProductHighlightsProps {
  product: ElectronicsProductHitValues
}

export const ElectronicsProductHighlights = ({
  product,
}: ElectronicsProductHighlightsProps) => {
  const { condition, warranty } = product
  const isNew = condition === 'New'

  const keySpecs = [
    { icon: Monitor, value: product.screenSize },
    { icon: HardDrive, value: product.storage ?? product.hardDiskSize },
    { icon: Cpu, value: product.cpu },
  ].filter((spec) => Boolean(spec.value))

  if (!condition && !warranty && keySpecs.length === 0) return null

  return (
    <div className="space-y-3">
      {(condition || warranty) && (
        <div className="flex flex-wrap gap-2">
          {condition && (
            <span
              className={cn(
                'rounded-badge inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium',
                isNew
                  ? 'bg-accent/10 text-accent'
                  : 'bg-muted text-muted-foreground',
              )}>
              <Sparkles className="h-3 w-3" />
              {condition}
            </span>
          )}
          {warranty && (
            <span className="bg-muted text-muted-foreground rounded-badge inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium">
              <ShieldCheck className="h-3 w-3" />
              {warranty}
            </span>
          )}
        </div>
      )}

      {keySpecs.length > 0 && (
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {keySpecs.map(({ icon: Icon, value }) => (
            <span key={value} className="inline-flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
