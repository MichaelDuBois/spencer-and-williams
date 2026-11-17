import { cn } from '@/lib/utils'

import type { LucideIcon } from 'lucide-react'

interface AccentIconTileProps {
  icon: LucideIcon
  accentColor: string
  className?: string
  iconClassName?: string
}

export const AccentIconTile = ({
  icon: Icon,
  accentColor,
  className,
  iconClassName,
}: AccentIconTileProps) => (
  <div
    className={cn(
      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
      className,
    )}
    style={{
      color: accentColor,
      backgroundColor: `color-mix(in oklch, ${accentColor} 12%, white)`,
    }}>
    <Icon className={cn('h-5 w-5', iconClassName)} aria-hidden />
  </div>
)
