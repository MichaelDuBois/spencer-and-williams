import type {
  B2BContentDisplayGroup,
  DisplayResultsData,
  DisplayGroup,
  QueryAttribution,
  SearchSummaries,
  TravelDisplayGroup,
  ToolHandler,
  ToolExecutionContext,
  ToolExecutionResult,
} from '@/features/aiAssistant/types'

/**
 * Display results tool definition.
 * Handles standard product display, travel content display, and B2B content display.
 */
export const DISPLAY_RESULTS_TOOL_NAME = 'displayResults'

/**
 * Check if a group has valid items (products, travel items, or B2B items).
 */
const groupHasItems = (
  group: DisplayGroup | TravelDisplayGroup | B2BContentDisplayGroup,
): boolean => {
  // Check for standard products array
  if (
    'products' in group &&
    Array.isArray(group.products) &&
    group.products.length > 0
  ) {
    return true
  }
  // Check for travel items array
  if (
    'items' in group &&
    Array.isArray(group.items) &&
    group.items.length > 0
  ) {
    return true
  }
  return false
}

/**
 * Drop groups the agent emitted but found nothing for; they would otherwise
 * render as a titled bubble wrapping an empty carousel. Filter attached queries
 * with the same positional mask so each retained group stays aligned. Returns
 * null when no group survives, i.e. there is nothing to display at all.
 */
export const withNonEmptyGroups = (
  data: DisplayResultsData,
): DisplayResultsData | null => {
  const inputGroups = data.groups as Array<
    DisplayGroup | TravelDisplayGroup | B2BContentDisplayGroup
  >
  const nonEmptyGroupMask = inputGroups?.map(groupHasItems)
  const groups = inputGroups?.filter((_, index) => nonEmptyGroupMask[index])
  if (!groups?.length) return null

  const queries = data.queries?.filter((_, index) => nonEmptyGroupMask[index])
  return { ...data, groups, ...(queries && { queries }) } as DisplayResultsData
}

/**
 * Drop the query attribution keys from a copy of `item`, whatever carried them.
 * Agent-echoed `queryID`/`position` must never reach a click event or the agent
 * prompt: attribution is joined client-side (withQueryAttribution), never
 * trusted from tool args.
 */
export const withoutAttribution = <T extends object>(item: T): T => {
  const slim = { ...item }
  delete (slim as Partial<QueryAttribution>).queryID
  delete (slim as Partial<QueryAttribution>).position
  return slim
}

/**
 * Copy each displayed product's query attribution (queryID + position) from the
 * search summaries that produced it, so a click on the card can emit the same
 * attributed product-click event as the search results page. The agent echoes
 * back only objectIDs, so the attribution is joined here rather than trusted
 * from the tool args: a product with a matching summary gets the joined
 * attribution, and every other product has its `queryID`/`position` keys
 * stripped, so agent-echoed values can never fabricate attribution. Only
 * products get attribution — content summaries carry no queryID.
 */
export const withQueryAttribution = (
  data: DisplayResultsData,
  summaries: SearchSummaries,
): DisplayResultsData => {
  const attribution = new Map<string, QueryAttribution>()
  summaries.forEach((summary) => {
    if (!('queryID' in summary) || typeof summary.queryID !== 'string') return

    attribution.set(summary.objectID, {
      queryID: summary.queryID,
      ...('position' in summary && typeof summary.position === 'number'
        ? { position: summary.position }
        : {}),
    })
  })

  const groups = data.groups as Array<
    DisplayGroup | TravelDisplayGroup | B2BContentDisplayGroup
  >

  return {
    ...data,
    groups: groups.map((group) =>
      'products' in group && Array.isArray(group.products)
        ? {
            ...group,
            products: group.products.map((product) => {
              const attributed = attribution.get(product.objectID)
              return attributed
                ? { ...product, ...attributed }
                : withoutAttribution(product)
            }),
          }
        : group,
    ) as DisplayResultsData['groups'],
  }
}

/**
 * Strip agent-echoed attribution without joining any. For display paths with
 * no search context the products cannot be attributed, so their
 * `queryID`/`position` keys are dropped and clicks from those cards emit
 * unattributed rather than fabricated values.
 */
export const withoutQueryAttribution = (
  data: DisplayResultsData,
): DisplayResultsData => withQueryAttribution(data, [])

/**
 * Parse displayResults arguments.
 */
const parseDisplayResultsArgs = (
  args: Record<string, unknown>,
): DisplayResultsData | null => {
  const data = args as unknown as DisplayResultsData

  if (!data || typeof data !== 'object') {
    console.warn('[displayResultsTool] Invalid input:', args)
    return null
  }

  return data
}

/**
 * Execute displayResults tool: validates items and updates message state.
 * The vertical field is injected by the tool executor. This path has no search
 * context (no summaries to join), so products cannot be attributed and their
 * agent-echoed attribution is stripped instead.
 */
const executeDisplayResults = async (
  data: DisplayResultsData,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> => {
  const displayData = withNonEmptyGroups(data)

  if (displayData) {
    context.appendDisplayResults(
      context.assistantMessageId,
      withoutQueryAttribution(displayData),
    )
  } else {
    context.appendNoResultsMessage(context.assistantMessageId)
  }

  return {}
}

export const displayResultsToolHandler: ToolHandler<DisplayResultsData> = {
  name: DISPLAY_RESULTS_TOOL_NAME,
  parseArgs: parseDisplayResultsArgs,
  execute: executeDisplayResults,
}
