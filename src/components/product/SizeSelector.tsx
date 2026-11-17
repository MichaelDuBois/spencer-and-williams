'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button/Button'
import { cn } from '@/lib/utils'

type SizeSelectorVariant = 'product' | 'editorial'

interface SizeSelectorProps {
  sizes?: string[]
  unavailableSizes?: string[]
  defaultSize?: string
  onChange?: (size: string) => void
  variant?: SizeSelectorVariant
  headerAction?: ReactNode
}

export const SizeSelector = ({
  sizes,
  unavailableSizes = [],
  defaultSize,
  onChange,
  variant = 'product',
  headerAction,
}: SizeSelectorProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    defaultSize ?? null,
  )

  if (!sizes || sizes.length === 0) return null

  const handleSizeSelect = (size: string) => {
    if (unavailableSizes.includes(size)) return
    setSelectedSize(size)
    onChange?.(size)
  }

  if (variant === 'editorial') {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs tracking-widest uppercase">Size</span>
          {headerAction}
        </div>
        <div className="flex flex-wrap gap-3">
          {sizes.map((size) => (
            <Button
              key={size}
              type="button"
              variant={selectedSize === size ? 'default' : 'outline'}
              disabled={unavailableSizes.includes(size)}
              className="h-12 min-w-12 rounded-none px-3 text-xs"
              onClick={() => handleSizeSelect(size)}>
              {size}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-foreground text-sm font-medium">Select Size</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isUnavailable = unavailableSizes.includes(size)
          const isSelected = selectedSize === size

          return (
            <button
              key={size}
              onClick={() => handleSizeSelect(size)}
              disabled={isUnavailable}
              className={cn(
                'rounded-button flex h-11 min-w-11 items-center justify-center border-2 px-3 text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'border-accent bg-background text-foreground'
                  : isUnavailable
                    ? 'border-border bg-muted text-muted-foreground/50 cursor-not-allowed'
                    : 'border-border bg-background text-foreground hover:border-foreground/30 cursor-pointer',
              )}>
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
