import type { ReactNode } from 'react'

interface SkuLabelProps {
  children: ReactNode
}

export const SkuLabel = ({ children }: SkuLabelProps) => (
  <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs font-medium tracking-wide">
    SKU: {children}
  </p>
)
