import {
  withoutAttribution,
  withNonEmptyGroups,
  withQueryAttribution,
  DISPLAY_RESULTS_TOOL_NAME,
} from '@/features/aiAssistant/tools/displayResultsTool'
import {
  parseSuggestActionsArgs,
  SUGGEST_ACTIONS_TOOL_NAME,
} from '@/features/aiAssistant/tools/suggestActionsTool'
import type {
  B2BContentSearchQuery,
  SearchQuery,
  TravelSearchQuery,
  ToolHandler,
  ToolExecutionContext,
  ToolExecutionResult,
  DisplayResultsData,
  UnifiedSearchResult,
} from '@/features/aiAssistant/types'

export const SEARCH_TOOL_NAME = 'search'

type AnySearchQuery = SearchQuery | TravelSearchQuery | B2BContentSearchQuery

/**
 * Parse search tool arguments from agent response.
 */
const parseSearchArgs = (
  args: Record<string, unknown>,
): AnySearchQuery[] | null => {
  const queries = (args.suggestions || args.queries) as AnySearchQuery[]

  if (!queries || !Array.isArray(queries)) {
    console.warn(
      '[searchTool] Invalid input - no suggestions or queries array:',
      args,
    )
    return null
  }

  return queries
}

/**
 * Drop already-shown items so a "See more like this" follow-up surfaces fresh
 * matches instead of repeats. Returns the summaries untouched when nothing has
 * been shown yet (the common path for regular searches), avoiding a wasted Set
 * allocation and full scan. Falls back to the full set if filtering would empty
 * it, so a genuinely small catalog still returns something.
 */
const getFreshCandidates = (
  summaries: UnifiedSearchResult['summaries'],
  shownObjectIDs?: string[],
): UnifiedSearchResult['summaries'] => {
  if (!shownObjectIDs?.length) return summaries

  const shown = new Set(shownObjectIDs)
  const fresh = summaries.filter((summary) => !shown.has(summary.objectID))
  // Cast preserves the union-array type that `.filter` widens to an element union.
  return (fresh.length > 0 ? fresh : summaries) as typeof summaries
}

/**
 * Slim the summaries for the agent prompt. The agent only needs the product
 * facts it echoes back (objectIDs among them) to pick what to display — query
 * attribution is joined client-side from the full summaries
 * (withQueryAttribution), so `queryID`/`position` are stripped here: they
 * would only bloat the prompt and risk coming back agent-echoed in tool args.
 */
const toAgentSummaries = (
  summaries: UnifiedSearchResult['summaries'],
): UnifiedSearchResult['summaries'] =>
  // Cast preserves the union-array type that `.map` widens to an element union.
  summaries.map((summary) =>
    withoutAttribution(summary),
  ) as UnifiedSearchResult['summaries']

/**
 * Execute search tool: runs Algolia search, sends results to agent,
 * and handles the displayResults response.
 */
const executeSearch = async (
  queries: AnySearchQuery[],
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> => {
  // Initialize streaming display
  context.setStreamingDisplay({
    intro: '',
    groups: [],
    streamingGroup: null,
    isStreaming: true,
    toolCallId: null,
  })

  try {
    // Execute search (unified hook routes based on query type)
    const result = await context.executeSearch(queries)

    // Drop already-shown items from the candidate pool so a "See more like this"
    // follow-up can't re-surface the same products — the agent only ever sees
    // fresh matches. Fall back to the full set if filtering would empty it, so a
    // genuinely small catalog still returns something rather than "no results".
    // Skip the Set/filter work entirely on regular searches (nothing shown yet).
    const candidates = getFreshCandidates(
      result.summaries,
      context.shownObjectIDs,
    )

    // Send results to agent for displayResults — slimmed, without attribution.
    const followUpResult = await context.sendFollowUp(
      toAgentSummaries(candidates),
    )

    context.setStreamingDisplay(null)

    // Handle tool calls from agent response
    const searchQueries = queries.map((q) => q.query)
    for (const toolCall of followUpResult.toolCalls) {
      if (toolCall.name === DISPLAY_RESULTS_TOOL_NAME) {
        const data = toolCall.args as unknown as DisplayResultsData
        const displayData = withNonEmptyGroups({
          ...data,
          queries: searchQueries,
        })
        if (displayData) {
          context.appendDisplayResults(
            context.assistantMessageId,
            withQueryAttribution(displayData, candidates),
          )
        } else {
          context.appendNoResultsMessage(context.assistantMessageId)
        }
      } else if (toolCall.name === SUGGEST_ACTIONS_TOOL_NAME) {
        const parsed = parseSuggestActionsArgs(
          toolCall.args as Record<string, unknown>,
        )
        if (parsed) {
          context.appendSuggestActions(
            context.assistantMessageId,
            parsed.actions,
            parsed.gartnerQuadrant,
          )
        }
      }
    }

    return {
      suggestions: followUpResult.suggestions,
    }
  } catch (error) {
    context.setStreamingDisplay(null)
    throw error
  }
}

export const searchToolHandler: ToolHandler<AnySearchQuery[]> = {
  name: SEARCH_TOOL_NAME,
  parseArgs: parseSearchArgs,
  execute: executeSearch,
}
