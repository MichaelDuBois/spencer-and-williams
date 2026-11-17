import { cn } from '@/lib/utils'

interface StockPillProps {
  inStock: boolean
  className?: string
}

export const StockPill = ({ inStock, className }: StockPillProps) => (
  <span
    className={cn(
      'text-micro inline-flex items-center rounded-full px-2 py-0.5 font-medium tracking-wide uppercase ring-1 backdrop-blur-md',
      inStock
        ? 'bg-accent/15 text-accent ring-accent/25'
        : 'bg-muted/60 text-muted-foreground ring-border',
      className,
    )}>
    {inStock ? 'In stock' : 'Out of stock'}
  </span>
)
