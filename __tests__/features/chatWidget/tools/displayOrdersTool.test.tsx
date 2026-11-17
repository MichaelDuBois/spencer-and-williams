import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChatWidgetPanelContext } from '@/features/chatWidget/components/chatWidgetPanelContext'
import { createDisplayOrdersTool } from '@/features/chatWidget/tools/displayOrdersTool'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import { installMatchMedia } from '../../../helpers/matchMedia'
import { buildProvidersWrapper, createMockConfig } from '../../../helpers/test-utils'

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components'
import type { ComponentProps } from 'react'
import type { Tool } from 'react-instantsearch'

vi.mock('next/link', () => {return {
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}})

type ToolCallArgs = Parameters<NonNullable<Tool['onToolCall']>>[0]

const makeOrder = (id: string, createdAt: number): OrderHistoryEntry => {return {
  id,
  createdAt,
  subtotal: 20,
  shipping: 0,
  total: 20,
  items: [
    {
      objectID: `${id}-item`,
      name: 'Running shoes',
      price: 20,
      quantity: 1,
    },
  ],
}}

const executeTool = async (input: unknown, orders: OrderHistoryEntry[]) => {
  const tool = createDisplayOrdersTool(() => orders)
  const onToolCall = tool.onToolCall
  if (!onToolCall) throw new Error('displayOrders must handle client tool calls')

  let output: unknown
  const addToolResult: ToolCallArgs['addToolResult'] = async (result) => {
    if ('output' in result) output = result.output
  }
  const args = {
    toolCallId: 'tool-call-1',
    toolName: 'displayOrders',
    input,
    signal: new AbortController().signal,
    addToolResult,
  } satisfies ToolCallArgs

  await onToolCall(args)
  return output
}

describe('createDisplayOrdersTool', () => {
  it('resolves displayOrders input against local order history', async () => {
    const output = await executeTool(
      { limit: 1, intro: 'Your latest order' },
      [makeOrder('older', 100), makeOrder('newer', 200)],
    )

    expect(output).toEqual({
      intro: 'Your latest order',
      orders: [
        expect.objectContaining({ id: 'newer', total: 20 }),
      ],
    })
  })

  it('returns an empty result for invalid tool input', async () => {
    await expect(executeTool('show orders', [makeOrder('order-1', 100)])).resolves.toEqual({
      orders: [],
    })
  })

  it('returns an empty result instead of recent orders for malformed orderIds', async () => {
    await expect(
      executeTool({ orderIds: [42] }, [makeOrder('order-1', 100)]),
    ).resolves.toEqual({ orders: [] })
  })

  it('returns an empty result instead of recent orders for an empty orderIds array', async () => {
    await expect(
      executeTool({ orderIds: [] }, [makeOrder('order-1', 100)]),
    ).resolves.toEqual({ orders: [] })
  })

  it('returns an empty result instead of recent orders for a non-numeric limit', async () => {
    await expect(
      executeTool({ limit: '2' }, [makeOrder('order-1', 100)]),
    ).resolves.toEqual({ orders: [] })
  })
})

describe('displayOrders layoutComponent', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const renderToolMessage = (collapsePanel: () => void) => {
    installMatchMedia(false)
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig())
    })
    const { Wrapper } = buildProvidersWrapper({ store })
    const DisplayOrdersToolMessage = createDisplayOrdersTool(
      () => [],
    ).layoutComponent
    if (!DisplayOrdersToolMessage) {
      throw new Error('displayOrders must define a layoutComponent')
    }

    const context = {
      message: {
        state: 'output-available',
        output: {
          orders: [
            {
              id: 'order-1',
              createdAt: 100,
              total: 20,
              items: [{ objectID: 'order-1-item', name: 'Running shoes' }],
            },
          ],
        },
      },
    } as unknown as ClientSideToolComponentProps['context']

    const props = { context } as unknown as ClientSideToolComponentProps

    return render(
      <ChatWidgetPanelContext.Provider value={collapsePanel}>
        <DisplayOrdersToolMessage {...props} />
      </ChatWidgetPanelContext.Provider>,
      { wrapper: Wrapper },
    )
  }

  it('collapses the chat widget panel, not the legacy assistant, on link click', () => {
    const collapsePanel = vi.fn()
    const { getByRole } = renderToolMessage(collapsePanel)

    const link = getByRole('link', { name: /order-1/ })
    link.addEventListener('click', (event) => event.preventDefault())
    link.click()

    expect(collapsePanel).toHaveBeenCalledOnce()
  })
})
