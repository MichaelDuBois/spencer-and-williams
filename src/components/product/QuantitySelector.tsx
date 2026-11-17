'use client'

import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export const QuantitySelector = ({
  value,
  onChange,
  min = 1,
  max,
}: QuantitySelectorProps) => {
  const handleDecrease = (): void => onChange(Math.max(min, value - 1))
  const handleIncrease = (): void =>
    onChange(max === undefined ? value + 1 : Math.min(max, value + 1))

  return (
    <div className="border-border rounded-button flex items-center border">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="text-muted-foreground hover:text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40">
        <Minus className="h-4 w-4" />
      </button>
      <span
        aria-live="polite"
        className="text-foreground w-8 text-center text-sm font-medium">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        disabled={max !== undefined && value >= max}
        aria-label="Increase quantity"
        className="text-muted-foreground hover:text-foreground flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
