'use client'

import { B2BContentCard } from '@/features/aiAssistant/components/messages/b2b-content/B2BContentCard'
import { ResultGroupShell } from '@/features/aiAssistant/components/messages/ResultGroupShell'
import { MOBILE_BREAKPOINT } from '@/features/aiAssistant/constants'
import { MAX_VISIBLE_ITEMS } from '@/features/aiAssistant/constants'
import type { B2BContentDisplayGroup } from '@/features/aiAssistant/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface B2BContentResultGroupProps {
  group: B2BContentDisplayGroup
  isExpanded?: boolean
  query?: string
}

/**
 * Group of B2B content with title, description, and layout based on type
 * and expansion state.
 * - Non-expanded: Always carousel for all types
 * - Expanded (desktop): Grid 2x2 for documentation/articles (icon-driven cards),
 *   carousel for blogs and resources (image-driven cards)
 * - Mobile: Always carousel for all types
 */
export const B2BContentResultGroup = ({
  group,
  isExpanded = false,
  query,
}: B2BContentResultGroupProps) => {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)
  // Only icon-driven types use grid layout when expanded on desktop
  const useGridLayout =
    isExpanded &&
    !isMobile &&
    (group.type === 'documentation' || group.type === 'articles')

  return (
    <ResultGroupShell
      title={group.title}
      why={group.why}
      query={query}
      titleClassName="font-semibold">
      {useGridLayout && (
        <div className="grid grid-cols-2 gap-3">
          {group.items.slice(0, MAX_VISIBLE_ITEMS).map((item) => (
            <B2BContentCard
              key={item.objectID}
              item={item}
              type={group.type}
              variant="grid"
            />
          ))}
        </div>
      )}

      {!useGridLayout && (
        <div className="-mx-4 px-4">
          <div className="scrollbar-slim flex gap-3 overflow-x-auto pb-2">
            {group.items.slice(0, MAX_VISIBLE_ITEMS).map((item) => (
              <B2BContentCard
                key={item.objectID}
                item={item}
                type={group.type}
                variant="carousel"
              />
            ))}
          </div>
        </div>
      )}
    </ResultGroupShell>
  )
}
