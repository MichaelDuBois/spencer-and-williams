import Link from 'next/link'
import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface ColorSwatch {
  objectID: string
  hex: string
  name: string
  href: string
}

interface ColorSelectorProps {
  colors: ColorSwatch[]
  selectedObjectID?: string
  headerAction?: ReactNode
}

export const ColorSelector = ({
  colors,
  selectedObjectID,
  headerAction,
}: ColorSelectorProps) => {
  if (colors.length === 0) return null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase">Color</span>
        {headerAction}
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = color.objectID === selectedObjectID
          return (
            <Link
              key={color.objectID}
              href={color.href}
              aria-label={color.name}
              aria-current={isSelected ? 'true' : undefined}
              title={color.name}
              className={cn(
                'border-border block h-8 w-8 rounded-full border outline-none',
                'focus-visible:ring-foreground focus-visible:ring-1 focus-visible:ring-offset-2',
                isSelected && 'ring-foreground ring-1 ring-offset-2',
              )}
              style={{ background: color.hex }}
            />
          )
        })}
      </div>
    </div>
  )
}
