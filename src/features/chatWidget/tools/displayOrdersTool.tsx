'use client'

import { PreviousOrdersMessage } from '@/features/aiAssistant/components/messages/PreviousOrdersMessage'
import {
  displayOrdersToolHandler,
  resolveOrderDisplayData,
} from '@/features/aiAssistant/tools/displayOrdersTool'
import { useCollapseChatWidgetPanel } from '@/features/chatWidget/components/chatWidgetPanelContext'
import { isOrderHistoryDisplayData } from '@/features/chatWidget/utils/orderDisplayMessages'
import type { OrderHistoryEntry } from '@/stores/orderHistory'
import { isPlainRecord } from '@/utilities/isPlainRecord'

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components'
import type { Tool } from 'react-instantsearch'

const DisplayOrdersToolMessage = ({
  context,
}: ClientSideToolComponentProps) => {
  const collapsePanel = useCollapseChatWidgetPanel()

  if (context.message.state !== 'output-available') return <></>

  const { output } = context.message
  if (!isOrderHistoryDisplayData(output) || output.orders.length === 0) {
    return <></>
  }

  return <PreviousOrdersMessage data={output} onLinkClick={collapsePanel} />
}

/**
 * An explicitly provided `orderIds`/`limit` that fails validation must not
 * fall through to the shared parser's recency default — that would display
 * unrelated orders in place of the agent's (malformed) request.
 */
const hasInvalidSelector = (input: Record<string, unknown>): boolean => {
  if ('orderIds' in input) {
    const { orderIds } = input
    if (
      !Array.isArray(orderIds) ||
      orderIds.length === 0 ||
      !orderIds.every((id) => typeof id === 'string')
    ) {
      return true
    }
  }

  if (
    'limit' in input &&
    !(typeof input.limit === 'number' && Number.isFinite(input.limit))
  ) {
    return true
  }

  return false
}

/**
 * Connects Agent Studio's displayOrders client tool to the local demo order
 * history and reuses the custom assistant's existing order-card presentation.
 */
export const createDisplayOrdersTool = (
  getOrders: () => OrderHistoryEntry[],
): Tool => {
  return {
    onToolCall: async ({ input, addToolResult }) => {
      const data =
        isPlainRecord(input) && !hasInvalidSelector(input)
          ? resolveOrderDisplayData(
              getOrders(),
              displayOrdersToolHandler.parseArgs(input) ?? {},
            )
          : null

      await addToolResult({ output: data ?? { orders: [] } })
    },
    layoutComponent: DisplayOrdersToolMessage,
  }
}
