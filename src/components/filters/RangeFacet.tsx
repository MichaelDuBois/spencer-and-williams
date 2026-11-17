'use client'

import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { useRangeSlider } from '@/hooks/useRangeSlider'
import { transitionSlow, transitionSmooth } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { FacetComponentProps, Variant } from '@/types'

const VARIANT_CLASSES: Record<Variant, { title: string }> = {
  standard: { title: 'text-foreground font-medium capitalize' },
  editorial: {
    title: 'text-muted-foreground text-xs tracking-widest uppercase',
  },
}

export const RangeFacet = ({
  title,
  attribute,
  prefix,
  defaultOpen = true,
  variant = 'standard',
}: FacetComponentProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const classes = VARIANT_CLASSES[variant]
  const stringAttribute = typeof attribute === 'string' ? attribute : undefined
  const {
    rangeMin,
    rangeMax,
    currentMin,
    currentMax,
    minPercent,
    maxPercent,
    canRefine,
    handleMinChange,
    handleMaxChange,
    handleCommit,
  } = useRangeSlider({ attribute: stringAttribute })

  if (!stringAttribute || !canRefine) return null

  const formatValue = (value: number) =>
    prefix ? `${prefix}${value}` : `${value}`

  return (
    <div className="border-border border-b py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between text-left">
        <span className={cn(classes.title)}>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 225 : 0 }}
          transition={transitionSlow}>
          <Plus className="text-muted-foreground h-4 w-4" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={transitionSmooth}
        className="overflow-hidden">
        <div className="pt-3">
          {/* Value labels */}
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-foreground">{formatValue(currentMin)}</span>
            <span className="text-foreground">{formatValue(currentMax)}</span>
          </div>

          {/* Dual range slider - h-5 to contain 16px thumbs */}
          <div className="relative flex h-5 items-center">
            {/* Background track */}
            <div className="bg-muted absolute inset-x-0 h-1.5 rounded-full" />

            {/* Filled track */}
            <div
              className="bg-accent/60 absolute h-1.5 rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />

            {/* Min slider */}
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              value={currentMin}
              onChange={handleMinChange}
              onMouseUp={handleCommit}
              onTouchEnd={handleCommit}
              className="[&::-webkit-slider-thumb]:bg-accent pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
            />

            {/* Max slider */}
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              value={currentMax}
              onChange={handleMaxChange}
              onMouseUp={handleCommit}
              onTouchEnd={handleCommit}
              className="[&::-webkit-slider-thumb]:bg-accent pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
