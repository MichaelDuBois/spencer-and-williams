import { SeeMoreLikeThisButton } from '@/features/aiAssistant/components/messages/SeeMoreLikeThisButton'
import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'

interface ResultGroupShellProps {
  /** Group title, also used to anchor the "See more like this" follow-up. */
  title: string
  /** Optional rationale shown under the title. */
  why?: string
  /** Originating query, fallback anchor for the follow-up. */
  query?: string
  /** Container override (e.g. `space-y-4` for fashion/grocery). */
  className?: string
  /** Title override for per-vertical typography (weight, family, tracking). */
  titleClassName?: string
  /** The vertical-specific card layout (carousel or grid). */
  children: ReactNode
}

export const ResultGroupShell = ({
  title,
  why,
  query,
  className,
  titleClassName,
  children,
}: ResultGroupShellProps) => (
  <div className={cn('space-y-3', className)}>
    <div>
      <h4 className={cn('text-sm', titleClassName)}>{title}</h4>
      {why && <p className="text-muted-foreground mt-0.5 text-xs">{why}</p>}
    </div>
    {children}
    <SeeMoreLikeThisButton title={title} query={query} />
  </div>
)
