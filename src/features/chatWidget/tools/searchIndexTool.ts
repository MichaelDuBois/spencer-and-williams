'use client'

import { createDefaultTools } from 'react-instantsearch'

import { ChatResultItem } from '@/features/chatWidget/components/ChatResultItem'
import { isRecord } from '@/utilities/isRecord'

const isGroupedResultsToolPart = (part: unknown): boolean =>
  isRecord(part) &&
  (part.type === 'tool-algolia_grouped_results' ||
    part.type === 'tool-algolia_display_results')

/**
 * The native search-result carousel must step aside when the same assistant
 * message includes grouped results. Checking sibling tool parts covers cached
 * responses whose metadata is not available when the search tool first renders.
 */
export const shouldRenderSearchIndexResults = (parentMessage: {
  metadata?: unknown
  parts?: unknown
}): boolean => {
  const metadata = isRecord(parentMessage.metadata)
    ? parentMessage.metadata
    : undefined
  const hasGroupedResultsMetadata =
    metadata?.groupedResultsEnabled === true ||
    metadata?.displayResultsEnabled === true
  const hasGroupedResultsTool =
    Array.isArray(parentMessage.parts) &&
    parentMessage.parts.some(isGroupedResultsToolPart)

  return !hasGroupedResultsMetadata && !hasGroupedResultsTool
}

interface SearchIndexToolRenderContext {
  parentMessage: {
    metadata?: unknown
    parts?: unknown
  }
}

/** The chat widget's search tool: default search wiring plus the `shouldRender` gate. */
export const createSearchIndexTool = () => {
  return {
    ...createDefaultTools(ChatResultItem).algolia_search_index,
    shouldRender: ({ parentMessage }: SearchIndexToolRenderContext) =>
      shouldRenderSearchIndexResults(parentMessage),
  }
}
