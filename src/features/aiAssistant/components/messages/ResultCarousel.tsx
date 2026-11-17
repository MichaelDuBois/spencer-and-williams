import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'

interface ResultCarouselProps {
  /** Carousel-specific overrides, e.g. `items-stretch` or a different gap. */
  className?: string
  children: ReactNode
}

/** Horizontal, edge-to-edge scroll strip shared by completed and streaming groups. */
export const ResultCarousel = ({
  className,
  children,
}: ResultCarouselProps) => (
  <div className="-mx-4 px-4">
    <div
      className={cn(
        'scrollbar-slim flex items-stretch gap-3 overflow-x-auto pb-2',
        className,
      )}>
      {children}
    </div>
  </div>
)
