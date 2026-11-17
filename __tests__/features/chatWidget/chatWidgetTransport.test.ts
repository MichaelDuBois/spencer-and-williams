import { describe, expect, it } from 'vitest'

import {
  createChatWidgetTransport,
  getClientAlgoliaAgent,
  type ChatWidgetRequestState,
} from '@/features/chatWidget/utils/chatWidgetTransport'

import type { UIMessage } from 'instantsearch.js/es/lib/ai-lite'

const MESSAGES: UIMessage[] = [
  { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'shoes' }] },
]
const BASE_API =
  'https://app.algolia.net/agent-studio/1/agents/agent-1/completions?compatibilityMode=ai-sdk-5'

const createTransport = (state: ChatWidgetRequestState) => {
  const { transport, setRequestState } = createChatWidgetTransport({
    appId: 'APP',
    apiKey: 'KEY',
    agentId: 'agent-1',
  })
  setRequestState(state)
  return transport
}

const prepare = async (
  state: ChatWidgetRequestState,
  trigger: 'submit-message' | 'regenerate-message' = 'submit-message',
) => {
  const transport = createTransport(state)
  return transport.prepareSendMessagesRequest?.({
    id: 'chat-1',
    messageId: undefined,
    messages: MESSAGES,
    trigger,
    requestMetadata: undefined,
    body: undefined,
    credentials: undefined,
    headers: undefined,
    api: BASE_API,
  })
}

describe('createChatWidgetTransport', () => {
  it('targets the Agent Studio completions endpoint', () => {
    expect(createTransport({}).api).toBe(BASE_API)
  })

  it('adds the search override to the body', async () => {
    const searchParameters = { products: { enablePersonalization: false } }

    expect(await prepare({ searchParameters })).toEqual({
      api: BASE_API,
      body: {
        id: 'chat-1',
        messageId: undefined,
        messages: MESSAGES,
        algolia: { searchParameters },
      },
    })
  })

  it('omits the algolia key when there is no override', async () => {
    const prepared = await prepare({})

    expect(prepared?.body).not.toHaveProperty('algolia')
  })

  it('bypasses the cache when regenerating', async () => {
    const prepared = await prepare({}, 'regenerate-message')

    expect(prepared?.api).toBe(`${BASE_API}&cache=false`)
  })

  it('sends the Algolia identity headers and chat agent', () => {
    const { headers } = createTransport({ algoliaAgent: 'Algolia (5.0.0)' })

    expect(typeof headers === 'function' ? headers() : headers).toEqual({
      'x-algolia-application-id': 'APP',
      'x-algolia-api-key': 'KEY',
      'x-algolia-agent': 'Algolia (5.0.0); chat',
    })
  })
})

describe('getClientAlgoliaAgent', () => {
  it('reads a v5 client user agent', () => {
    expect(getClientAlgoliaAgent({ _ua: 'Algolia (5.0.0)' })).toBe(
      'Algolia (5.0.0)',
    )
  })

  it('returns undefined for anything else', () => {
    expect(getClientAlgoliaAgent(null)).toBeUndefined()
    expect(getClientAlgoliaAgent({})).toBeUndefined()
  })
})
