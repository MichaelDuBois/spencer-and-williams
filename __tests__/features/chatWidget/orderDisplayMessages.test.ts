import { describe, expect, it } from 'vitest'

import { getOrderDisplayMessages } from '@/features/chatWidget/utils/orderDisplayMessages'

import type { ChatMessageBase } from 'instantsearch-ui-components'

const text = (id: string, value: string): ChatMessageBase => {
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text: value }],
  }
}

const orderPart = {
  type: 'tool-displayOrders',
  toolCallId: 'orders-1',
  state: 'output-available',
  input: {},
  output: {
    intro: 'Here’s your most recent order:',
    orders: [{ id: 'order-1', createdAt: 100, total: 20, items: [] }],
  },
} satisfies ChatMessageBase['parts'][number]

const orderMessage: ChatMessageBase = {
  id: 'orders',
  role: 'assistant',
  parts: [orderPart],
}

describe('getOrderDisplayMessages', () => {
  it('keeps the intro, cards and suggestions but removes the repeated heading', () => {
    const suggestions = {
      type: 'data-suggestions',
      data: { suggestions: ['Track it'] },
    } as const
    const message: ChatMessageBase = {
      ...orderMessage,
      parts: [
        orderPart,
        { type: 'text', text: orderPart.output.intro },
        suggestions,
      ],
    }

    expect(getOrderDisplayMessages([message])[0].parts).toEqual([
      orderPart,
      suggestions,
    ])
    expect(message.parts).toHaveLength(3)
  })

  it('suppresses a separate streamed continuation in the same turn', () => {
    expect(
      getOrderDisplayMessages([
        orderMessage,
        text('continuation', 'Here’s your most recent order:'),
      ])[1].parts,
    ).toEqual([])
  })

  it('preserves useful text after cards in the same message and later continuations', () => {
    const explanation = 'The return window is 30 days.'
    const message: ChatMessageBase = {
      ...orderMessage,
      parts: [orderPart, { type: 'text', text: explanation }],
    }
    const continuation = text('continuation', 'Use the returns page to start.')

    expect(getOrderDisplayMessages([message, continuation])).toEqual([
      message,
      continuation,
    ])
  })

  it('removes a repeated heading line while preserving additional information', () => {
    const answer = text(
      'answer',
      `${orderPart.output.intro}\n\nThe return window is 30 days.`,
    )

    expect(getOrderDisplayMessages([orderMessage, answer])).toEqual([
      orderMessage,
      text('answer', 'The return window is 30 days.'),
    ])
    expect(answer.parts[0]).toEqual({
      type: 'text',
      text: `${orderPart.output.intro}\n\nThe return window is 30 days.`,
    })
  })

  it.each([
    '✅ Here are your most recent orders:',
    '✅Here are your most recent orders:',
    '✅ **Here are your most recent orders:**',
    '### Here are your most recent orders:',
  ])('removes a decorated duplicate heading (%s)', (heading) => {
    const message: ChatMessageBase = {
      ...orderMessage,
      parts: [
        {
          ...orderPart,
          output: {
            ...orderPart.output,
            intro: 'Here are your most recent orders:',
          },
        },
        { type: 'text', text: heading },
      ],
    }

    expect(getOrderDisplayMessages([message])[0].parts).toEqual([
      message.parts[0],
    ])
  })

  it('preserves extra information on the same line as the heading', () => {
    const answer = text(
      'answer',
      `✅ ${orderPart.output.intro} The return window is 30 days.`,
    )

    expect(getOrderDisplayMessages([orderMessage, answer])).toEqual([
      orderMessage,
      answer,
    ])
  })

  it('removes an identical heading with surrounding whitespace', () => {
    const answer = text('answer', `\n ${orderPart.output.intro} \n`)

    expect(getOrderDisplayMessages([orderMessage, answer])[1].parts).toEqual([])
  })

  it('preserves the same heading after a new user message', () => {
    const user: ChatMessageBase = {
      id: 'user',
      role: 'user',
      parts: [{ type: 'text', text: 'Show that heading again' }],
    }
    const answer = text('answer', orderPart.output.intro)

    expect(getOrderDisplayMessages([orderMessage, user, answer])).toEqual([
      orderMessage,
      user,
      answer,
    ])
  })

  it('preserves text before the cards and answers to later user messages', () => {
    const before = text('before', 'Let me check.')
    const user: ChatMessageBase = {
      id: 'user',
      role: 'user',
      parts: [{ type: 'text', text: 'What is your return policy?' }],
    }
    const answer = text('answer', '**Returns** are accepted.')

    expect(
      getOrderDisplayMessages([before, orderMessage, user, answer]),
    ).toEqual([before, orderMessage, user, answer])
  })

  it.each([
    { ...orderPart, state: 'input-available', output: undefined },
    {
      type: 'tool-displayOrders',
      toolCallId: 'orders-1',
      state: 'output-error',
      input: {},
      errorText: 'Failed',
    },
    { ...orderPart, output: { intro: 'Orders', orders: [] } },
    { ...orderPart, output: { orders: orderPart.output.orders } },
    { ...orderPart, output: { intro: 'Orders', orders: [{ id: 42 }] } },
    { ...orderPart, type: 'tool-other' },
  ] satisfies ChatMessageBase['parts'][number][])(
    'preserves text when no order heading and cards are rendered (%j)',
    (part) => {
      const messages: ChatMessageBase[] = [
        { ...orderMessage, parts: [part] },
        text('answer', 'An explanation'),
      ]
      expect(getOrderDisplayMessages(messages)).toEqual(messages)
    },
  )
})
