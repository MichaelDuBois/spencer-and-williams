import { describe, expect, it, vi } from 'vitest'

import {
  displayOrdersToolHandler,
  DISPLAY_ORDERS_TOOL_NAME,
  extractStreamingOrdersArgs,
  resolveOrderDisplayData,
  resolveStreamingOrderPreview,
} from '@/features/aiAssistant/tools/displayOrdersTool'
import type { ToolExecutionContext } from '@/features/aiAssistant/types'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

const makeOrder = (
  id: string,
  createdAt: number,
  overrides: Partial<OrderHistoryEntry> = {},
): OrderHistoryEntry => {return {
  id,
  createdAt,
  items: [
    { objectID: `${id}-a`, name: 'Item A', price: 10, quantity: 1 },
    { objectID: `${id}-b`, name: 'Item B', price: 5, quantity: 2 },
  ],
  subtotal: 20,
  shipping: 0,
  total: 20,
  ...overrides,
}}

const makeContext = (orders: OrderHistoryEntry[]) => {
  const appendOrderHistory = vi.fn()
  const appendNoResultsMessage = vi.fn()
  const context = {
    assistantMessageId: 'msg-1',
    vertical: 'ecommerce',
    orders,
    appendOrderHistory,
    appendNoResultsMessage,
  } as unknown as ToolExecutionContext
  return { context, appendOrderHistory, appendNoResultsMessage }
}

describe('displayOrdersToolHandler', () => {
  it('is registered under the displayOrders name', () => {
    expect(displayOrdersToolHandler.name).toBe(DISPLAY_ORDERS_TOOL_NAME)
    expect(DISPLAY_ORDERS_TOOL_NAME).toBe('displayOrders')
  })
})

describe('parseArgs', () => {
  const { parseArgs } = displayOrdersToolHandler

  it('parses valid orderIds, limit, and intro', () => {
    expect(
      parseArgs({ orderIds: ['a', 'b'], limit: 3, intro: 'Here you go' }),
    ).toEqual({ orderIds: ['a', 'b'], limit: 3, intro: 'Here you go' })
  })

  it('returns an empty object for an empty input object', () => {
    expect(parseArgs({})).toEqual({})
  })

  it('returns null for a non-object input', () => {
    expect(parseArgs(null as unknown as Record<string, unknown>)).toBeNull()
  })

  it('clamps limit into the 1..10 range', () => {
    expect(parseArgs({ limit: 0 })).toEqual({ limit: 1 })
    expect(parseArgs({ limit: 99 })).toEqual({ limit: 10 })
  })

  it('drops non-string ids and ignores an empty resulting array', () => {
    expect(parseArgs({ orderIds: ['a', 1, null, 'b'] })).toEqual({
      orderIds: ['a', 'b'],
    })
    expect(parseArgs({ orderIds: [1, 2] })).toEqual({})
  })

  it('ignores non-finite limit and non-string intro', () => {
    expect(parseArgs({ limit: NaN, intro: 42 })).toEqual({})
  })
})

describe('execute', () => {
  const { execute } = displayOrdersToolHandler

  it('selects orders by orderIds preserving agent order and ignoring unknown ids', async () => {
    const orders = [
      makeOrder('o1', 300),
      makeOrder('o2', 200),
      makeOrder('o3', 100),
    ]
    const { context, appendOrderHistory, appendNoResultsMessage } =
      makeContext(orders)

    await execute(
      { orderIds: ['o3', 'unknown', 'o1'], intro: 'Your orders' },
      context,
    )

    expect(appendNoResultsMessage).not.toHaveBeenCalled()
    expect(appendOrderHistory).toHaveBeenCalledTimes(1)
    const [messageId, data] = appendOrderHistory.mock.calls[0]
    expect(messageId).toBe('msg-1')
    expect(data.intro).toBe('Your orders')
    expect(data.orders.map((o: { id: string }) => o.id)).toEqual(['o3', 'o1'])
  })

  it('maps stored entries to the display shape', async () => {
    const orders = [
      makeOrder('o1', 300, { statusOverride: 'returned', total: 42 }),
    ]
    const { context, appendOrderHistory } = makeContext(orders)

    await execute({ orderIds: ['o1'] }, context)

    const [, data] = appendOrderHistory.mock.calls[0]
    expect(data.orders[0]).toMatchObject({
      id: 'o1',
      createdAt: 300,
      status: 'returned',
      total: 42,
    })
    expect(data.orders[0].items).toHaveLength(2)
    expect(data.orders[0].items[0]).toMatchObject({
      objectID: 'o1-a',
      name: 'Item A',
      quantity: 1,
    })
  })

  it('selects most-recent orders by limit, sorted desc', async () => {
    const orders = [
      makeOrder('old', 100),
      makeOrder('newest', 300),
      makeOrder('mid', 200),
    ]
    const { context, appendOrderHistory } = makeContext(orders)

    await execute({ limit: 2 }, context)

    const [, data] = appendOrderHistory.mock.calls[0]
    expect(data.orders.map((o: { id: string }) => o.id)).toEqual([
      'newest',
      'mid',
    ])
  })

  it('defaults to the 5 most-recent orders when no limit is given', async () => {
    const orders = Array.from({ length: 8 }, (_, i) =>
      makeOrder(`o${i}`, i * 100),
    )
    const { context, appendOrderHistory } = makeContext(orders)

    await execute({}, context)

    const [, data] = appendOrderHistory.mock.calls[0]
    expect(data.orders).toHaveLength(5)
    expect(data.orders[0].id).toBe('o7')
  })

  it('clamps the limit when selecting by recency', async () => {
    const orders = Array.from({ length: 12 }, (_, i) =>
      makeOrder(`o${i}`, i * 100),
    )
    const { context, appendOrderHistory } = makeContext(orders)

    await execute({ limit: 20 }, context)

    const [, data] = appendOrderHistory.mock.calls[0]
    expect(data.orders).toHaveLength(10)
  })

  it('shows the no-results message when history is empty', async () => {
    const { context, appendOrderHistory, appendNoResultsMessage } =
      makeContext([])

    await execute({}, context)

    expect(appendOrderHistory).not.toHaveBeenCalled()
    expect(appendNoResultsMessage).toHaveBeenCalledWith('msg-1')
  })

  it('shows the no-results message when all requested ids are unknown', async () => {
    const orders = [makeOrder('o1', 100)]
    const { context, appendOrderHistory, appendNoResultsMessage } =
      makeContext(orders)

    await execute({ orderIds: ['nope', 'nada'] }, context)

    expect(appendOrderHistory).not.toHaveBeenCalled()
    expect(appendNoResultsMessage).toHaveBeenCalledWith('msg-1')
  })
})

describe('resolveOrderDisplayData', () => {
  it('returns display data with intro for a matching selection', () => {
    const orders = [makeOrder('o1', 200), makeOrder('o2', 100)]

    const data = resolveOrderDisplayData(orders, {
      orderIds: ['o2'],
      intro: 'Here it is',
    })

    expect(data).not.toBeNull()
    expect(data?.intro).toBe('Here it is')
    expect(data?.orders.map((o) => o.id)).toEqual(['o2'])
  })

  it('omits intro when none is provided', () => {
    const data = resolveOrderDisplayData([makeOrder('o1', 100)], {})
    expect(data?.intro).toBeUndefined()
    expect(data?.orders).toHaveLength(1)
  })

  it('returns null when the selection is empty', () => {
    expect(resolveOrderDisplayData([], {})).toBeNull()
    expect(
      resolveOrderDisplayData([makeOrder('o1', 100)], { orderIds: ['nope'] }),
    ).toBeNull()
  })
})

describe('extractStreamingOrdersArgs', () => {
  it('fully parses a complete JSON buffer', () => {
    expect(
      extractStreamingOrdersArgs('{"orderIds":["o1"],"intro":"Your order"}'),
    ).toEqual({ orderIds: ['o1'], intro: 'Your order' })
  })

  it('extracts the intro from a partial buffer that is not valid JSON yet', () => {
    expect(
      extractStreamingOrdersArgs('{"intro":"Here are your orders'),
    ).toEqual({ intro: 'Here are your orders' })
  })

  it('unescapes quotes inside a partial intro', () => {
    expect(
      extractStreamingOrdersArgs('{"intro":"Your \\"last\\" order'),
    ).toEqual({ intro: 'Your "last" order' })
  })

  it('returns an empty object when nothing is extractable', () => {
    expect(extractStreamingOrdersArgs('{"orde')).toEqual({})
  })

  it('extracts orderIds once the array has fully streamed in', () => {
    expect(
      extractStreamingOrdersArgs('{"orderIds":["o6"],"intro":"Here is'),
    ).toEqual({ orderIds: ['o6'], intro: 'Here is' })
  })

  it('ignores orderIds while the array is still mid-stream', () => {
    expect(extractStreamingOrdersArgs('{"orderIds":["o6')).toEqual({})
  })

  it('extracts limit only once it is terminated by a delimiter', () => {
    expect(extractStreamingOrdersArgs('{"limit":2,"intro":"x')).toEqual({
      limit: 2,
      intro: 'x',
    })
    // A bare "1" with nothing after it could still be the "1" of a "10".
    expect(extractStreamingOrdersArgs('{"limit":1')).toEqual({})
  })

  it('clamps an extracted limit into the valid range', () => {
    expect(extractStreamingOrdersArgs('{"limit":99}')).toEqual({ limit: 10 })
  })
})

describe('resolveStreamingOrderPreview', () => {
  it('resolves the requested order once orderIds have streamed in', () => {
    const orders = [makeOrder('o1', 200), makeOrder('o6', 100)]

    const data = resolveStreamingOrderPreview(orders, {
      orderIds: ['o6'],
      intro: 'Here is your last order',
    })

    expect(data?.orders.map((o) => o.id)).toEqual(['o6'])
    expect(data?.intro).toBe('Here is your last order')
  })

  it('resolves by limit once it has streamed in', () => {
    const orders = [
      makeOrder('old', 100),
      makeOrder('newest', 300),
      makeOrder('mid', 200),
    ]

    const data = resolveStreamingOrderPreview(orders, { limit: 1 })

    expect(data?.orders.map((o) => o.id)).toEqual(['newest'])
  })

  it('previews the intro alone before any selection has arrived', () => {
    const orders = Array.from({ length: 6 }, (_, i) => makeOrder(`o${i}`, i))

    const data = resolveStreamingOrderPreview(orders, { intro: 'One moment' })

    // No recency fallback: the full order list must not flash before the
    // agent's selection streams in.
    expect(data).toEqual({ orders: [], intro: 'One moment' })
  })

  it('returns null when neither a selection nor an intro is present', () => {
    const orders = Array.from({ length: 6 }, (_, i) => makeOrder(`o${i}`, i))

    expect(resolveStreamingOrderPreview(orders, {})).toBeNull()
  })

  it('falls back to the intro bubble when the requested ids are unknown', () => {
    const orders = [makeOrder('o1', 100)]

    const data = resolveStreamingOrderPreview(orders, {
      orderIds: ['nope'],
      intro: 'Looking',
    })

    expect(data).toEqual({ orders: [], intro: 'Looking' })
  })
})
