'use client'

import type { DisplayResultsData } from '@/features/aiAssistant/types'
import { getVerticalConfig } from '@/features/aiAssistant/verticals/registry'

interface DisplayResultsMessageProps {
  data: DisplayResultsData
  isExpanded?: boolean
}

/**
 * Renders displayResults tool output with intro and groups.
 * Group rendering is delegated to the active vertical's config so this file
 * stays vertical-agnostic — adding a new vertical doesn't require editing it.
 * Each group is displayed as a separate bubble.
 */
export const DisplayResultsMessage = ({
  data,
  isExpanded = false,
}: DisplayResultsMessageProps) => {
  const verticalConfig = getVerticalConfig(data.vertical)

  return (
    <div className="space-y-3">
      {/* Grounded answer as its own bubble, above the resources */}
      {data.answer && (
        <div className="bg-muted text-foreground rounded-card px-4 py-2">
          <p className="text-sm whitespace-pre-wrap">{data.answer}</p>
        </div>
      )}

      {/* Intro as its own bubble */}
      {data.intro && (
        <div className="bg-muted text-foreground rounded-card px-4 py-2">
          <p className="text-sm font-medium">{data.intro}</p>
        </div>
      )}

      {/* Each group as a separate bubble */}
      {data.groups?.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="bg-muted text-foreground rounded-card w-fit max-w-full px-4 py-3">
          {verticalConfig.renderResultGroup(group, isExpanded, {
            vertical: data.vertical ?? verticalConfig.slug,
            query: data.queries?.[groupIndex],
          })}
        </div>
      ))}
    </div>
  )
}
