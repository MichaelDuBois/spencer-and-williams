import type {
  DisplayOrdersArgs,
  OrderHistoryDisplayData,
  OrderHistoryDisplayItem,
  ToolExecutionContext,
  ToolExecutionResult,
  ToolHandler,
} from '@/features/aiAssistant/types'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

/**
 * Display previous orders tool definition.
 * Renders order cards in chat from the current session's local order history
 * (client-side), never from Algolia. Data is resolved locally in execute.
 */
export const DISPLAY_ORDERS_TOOL_NAME = 'displayOrders'

const DEFAULT_LIMIT = 5
const MIN_LIMIT = 1
const MAX_LIMIT = 10

const clampLimit = (limit: number): number =>
  Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(limit)))

/**
 * Parse and defensively validate displayOrders arguments.
 */
const parseDisplayOrdersArgs = (
  args: Record<string, unknown>,
): DisplayOrdersArgs | null => {
  if (!args || typeof args !== 'object') {
    console.warn('[displayOrdersTool] Invalid input:', args)
    return null
  }

  const parsed: DisplayOrdersArgs = {}

  if (Array.isArray(args.orderIds)) {
    const ids = args.orderIds.filter(
      (id): id is string => typeof id === 'string',
    )
    if (ids.length > 0) parsed.orderIds = ids
  }

  if (typeof args.limit === 'number' && Number.isFinite(args.limit)) {
    parsed.limit = clampLimit(args.limit)
  }

  if (typeof args.intro === 'string') {
    parsed.intro = args.intro
  }

  return parsed
}

/**
 * Best-effort parse of a partially-streamed displayOrders tool input. Once the
 * buffer is complete JSON it defers to parseDisplayOrdersArgs; while still
 * partial it regex-extracts whatever fields have fully arrived (orderIds, limit,
 * intro) so the preview can resolve the right orders instead of falling back to
 * the recency default while the selection is still streaming in.
 */
export const extractStreamingOrdersArgs = (
  buffer: string,
): DisplayOrdersArgs => {
  try {
    const parsed = parseDisplayOrdersArgs(JSON.parse(buffer))
    if (parsed) return parsed
  } catch {
    // Input still streaming — fall through to lenient per-field extraction.
  }

  const args: DisplayOrdersArgs = {}

  // orderIds: only once the array has fully streamed in (a closing "]" is
  // present) so we never resolve off a half-streamed id list.
  const orderIdsMatch = buffer.match(/"orderIds"\s*:\s*(\[[^\]]*\])/)
  if (orderIdsMatch) {
    try {
      const ids = JSON.parse(orderIdsMatch[1])
      if (Array.isArray(ids)) {
        const strings = ids.filter((id): id is string => typeof id === 'string')
        if (strings.length > 0) args.orderIds = strings
      }
    } catch {
      // Array isn't valid JSON yet — ignore until it completes.
    }
  }

  // limit: require a trailing delimiter so a value still mid-stream (the "1" of
  // a to-be "10") isn't read early.
  const limitMatch = buffer.match(/"limit"\s*:\s*(\d+)\s*[,}]/)
  if (limitMatch) {
    args.limit = clampLimit(Number(limitMatch[1]))
  }

  // No trailing quote: the character class stops at the first unescaped quote,
  // so this captures both a finished intro and one still mid-stream.
  const introMatch = buffer.match(/"intro"\s*:\s*"((?:[^"\\]|\\.)*)/)
  if (introMatch) {
    try {
      args.intro = JSON.parse(`"${introMatch[1]}"`)
    } catch {
      args.intro = introMatch[1]
    }
  }
  return args
}

/**
 * Map a stored order entry to the chat display shape.
 */
const toDisplayItem = (order: OrderHistoryEntry): OrderHistoryDisplayItem => {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.statusOverride,
    total: order.total,
    items: order.items.map((item) => {
      return {
        objectID: item.objectID,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }
    }),
  }
}

/**
 * Select orders by explicit ids (preserving the agent's ordering, ignoring
 * unknown ids) or, when none given, by recency up to the clamped limit.
 */
const selectOrders = (
  orders: OrderHistoryEntry[],
  args: DisplayOrdersArgs,
): OrderHistoryEntry[] => {
  if (args.orderIds && args.orderIds.length > 0) {
    const byId = new Map(orders.map((order) => [order.id, order]))
    return args.orderIds
      .map((id) => byId.get(id))
      .filter((order): order is OrderHistoryEntry => order !== undefined)
  }

  const limit = clampLimit(args.limit ?? DEFAULT_LIMIT)
  return [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
}

/**
 * Resolve displayOrders args against local session history into the chat
 * display shape. Returns null when the selection is empty. Shared by execute
 * (final render) and the live streaming preview.
 */
export const resolveOrderDisplayData = (
  orders: OrderHistoryEntry[],
  args: DisplayOrdersArgs,
): OrderHistoryDisplayData | null => {
  const selected = selectOrders(orders, args)
  if (selected.length === 0) return null

  const data: OrderHistoryDisplayData = {
    orders: selected.map(toDisplayItem),
  }
  if (args.intro) data.intro = args.intro
  return data
}

/**
 * Resolve a live preview from partially-parsed streaming args. Unlike the final
 * render, this must NOT apply the recency fallback before the agent's selection
 * has streamed in — otherwise the preview flashes the full recent-orders list
 * and only collapses to the requested order once orderIds/limit arrive. So
 * cards render only once a selection signal is present; until then it previews
 * just the intro bubble (streaming ahead of the cards), or nothing.
 */
export const resolveStreamingOrderPreview = (
  orders: OrderHistoryEntry[],
  args: DisplayOrdersArgs,
): OrderHistoryDisplayData | null => {
  const hasSelection =
    (args.orderIds !== undefined && args.orderIds.length > 0) ||
    args.limit !== undefined

  if (hasSelection) {
    const resolved = resolveOrderDisplayData(orders, args)
    if (resolved) return resolved
  }

  if (args.intro) return { orders: [], intro: args.intro }
  return null
}

/**
 * Execute displayOrders: resolve orders from local session history and update
 * message state, or show a no-results message when the selection is empty.
 */
const executeDisplayOrders = async (
  args: DisplayOrdersArgs,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> => {
  const data = resolveOrderDisplayData(context.orders, args)

  if (!data) {
    context.appendNoResultsMessage(context.assistantMessageId)
    return {}
  }

  context.appendOrderHistory(context.assistantMessageId, data)
  return {}
}

export const displayOrdersToolHandler: ToolHandler<DisplayOrdersArgs> = {
  name: DISPLAY_ORDERS_TOOL_NAME,
  parseArgs: parseDisplayOrdersArgs,
  execute: executeDisplayOrders,
}
