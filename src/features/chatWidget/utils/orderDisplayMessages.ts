import type { OrderHistoryDisplayData } from '@/features/aiAssistant/types'
import { isPlainRecord } from '@/utilities/isPlainRecord'

import type { ChatMessageBase } from 'instantsearch-ui-components'

export const isOrderHistoryDisplayData = (
  value: unknown,
): value is OrderHistoryDisplayData => {
  if (!isPlainRecord(value) || !Array.isArray(value.orders)) return false

  return value.orders.every((order) => {
    if (
      !isPlainRecord(order) ||
      typeof order.id !== 'string' ||
      typeof order.createdAt !== 'number' ||
      typeof order.total !== 'number' ||
      !Array.isArray(order.items)
    ) {
      return false
    }

    return order.items.every(
      (item) =>
        isPlainRecord(item) &&
        typeof item.objectID === 'string' &&
        typeof item.name === 'string',
    )
  })
}

// Ignore leading emoji and Markdown decoration when comparing heading lines.
const normalizeOrderHeading = (heading: string): string =>
  heading
    .replace(/^[\s\p{Extended_Pictographic}\uFE0F\u200D#>*_`-]+/u, '')
    .replace(/[*_`]+\s*$/u, '')
    .trim()

/** Only the rendered conversation is filtered; transport and persistence retain the response. */
export const getOrderDisplayMessages = (
  messages: ChatMessageBase[],
): ChatMessageBase[] => {
  const orderHeadings = new Set<string>()

  return messages.map((message) => {
    if (message.role === 'user') orderHeadings.clear()
    if (message.role !== 'assistant') return message

    const parts = message.parts.flatMap<ChatMessageBase['parts'][number]>(
      (part) => {
        if (
          part.type === 'tool-displayOrders' &&
          part.state === 'output-available' &&
          isOrderHistoryDisplayData(part.output) &&
          part.output.orders.length > 0 &&
          typeof part.output.intro === 'string' &&
          part.output.intro.trim().length > 0
        ) {
          const heading = normalizeOrderHeading(part.output.intro)
          if (heading) orderHeadings.add(heading)
        }

        if (part.type !== 'text' || orderHeadings.size === 0) return [part]

        const lines = part.text.split('\n')
        const remainingLines = lines.filter(
          (line) => !orderHeadings.has(normalizeOrderHeading(line)),
        )
        if (remainingLines.length === lines.length) return [part]

        const text = remainingLines.join('\n').trim()
        return text ? [{ ...part, text }] : []
      },
    )

    return parts.every((part, index) => part === message.parts[index]) &&
      parts.length === message.parts.length
      ? message
      : { ...message, parts }
  })
}
