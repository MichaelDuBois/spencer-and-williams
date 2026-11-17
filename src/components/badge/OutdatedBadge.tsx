import { cn } from '@/lib/utils'

interface OutdatedBadgeProps {
  /** `compact` suits dense assistant cards; `default` suits full hit cards. */
  size?: 'default' | 'compact'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<OutdatedBadgeProps['size']>, string> = {
  default: 'px-2 text-xs',
  compact: 'text-micro px-1.5',
}

export const OutdatedBadge = ({
  size = 'default',
  className,
}: OutdatedBadgeProps) => (
  <span
    className={cn(
      'bg-warning/10 text-warning inline-flex items-center rounded-full py-0.5 font-medium',
      SIZE_CLASSES[size],
      className,
    )}>
    Outdated
  </span>
)
