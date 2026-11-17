'use client'

import Link from 'next/link'

import type { HitColorVariant } from '@/components/hit/hit.types'
import { cn } from '@/lib/utils'

interface HitVariantRowProps {
  colorVariants: HitColorVariant[]
  activeObjectID: string
  onVariantHover: (variant: HitColorVariant) => void
  onVariantClick: (variant: HitColorVariant) => void
  className?: string
}

export const HitVariantRow = ({
  colorVariants,
  activeObjectID,
  onVariantHover,
  onVariantClick,
  className,
}: HitVariantRowProps) => (
  <div className={className}>
    {colorVariants.slice(0, MAX_SWATCHES).map((colorVariant) => (
      <Link
        key={colorVariant.objectID}
        href={colorVariant.href}
        aria-label={colorVariant.name}
        title={colorVariant.name}
        onMouseEnter={() => onVariantHover(colorVariant)}
        onClick={() => onVariantClick(colorVariant)}
        className={cn(
          'border-border block h-4 w-4 rounded-full border outline-none',
          'focus-visible:ring-foreground focus-visible:ring-1 focus-visible:ring-offset-1',
          colorVariant.objectID === activeObjectID &&
            'ring-foreground ring-1 ring-offset-1',
        )}
        style={{ background: colorVariant.hex }}
      />
    ))}
    {colorVariants.length > MAX_SWATCHES && (
      <span className="text-muted-foreground text-micro">
        +{colorVariants.length - MAX_SWATCHES}
      </span>
    )}
  </div>
)

const MAX_SWATCHES = 3
