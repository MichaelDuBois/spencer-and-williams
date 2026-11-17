import type { ChatSearchParameters } from '@/features/chatWidget/utils/buildChatSearchParameters'
import { isRecord } from '@/utilities/isRecord'

import type {
  HttpChatTransportInitOptions,
  UIMessage,
} from 'instantsearch.js/es/lib/ai-lite'

export type ChatWidgetTransport = HttpChatTransportInitOptions<UIMessage>

/** Per-request values, read at send time so the transport identity never changes. */
export interface ChatWidgetRequestState {
  searchParameters?: ChatSearchParameters
  algoliaAgent?: string
}

interface CreateChatWidgetTransportArgs {
  appId: string
  apiKey: string
  agentId: string
}

interface ChatWidgetTransportHandle {
  transport: ChatWidgetTransport
  setRequestState: (state: ChatWidgetRequestState) => void
}

const buildChatCompletionsUrl = (
  appId: string,
  agentId: string,
  bypassCache = false,
): string => {
  const url = new URL(
    `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions`,
  )
  url.search = new URLSearchParams({
    compatibilityMode: 'ai-sdk-5',
    ...(bypassCache ? { cache: 'false' } : {}),
  }).toString()
  return url.toString()
}

// On instantsearch upgrades, re-check connectChat's URL, headers, regenerate cache bypass, ai-lite types and client `_ua`.
/** Mirrors connectChat's built-in Agent Studio transport, plus the search override. */
export const createChatWidgetTransport = ({
  appId,
  apiKey,
  agentId,
}: CreateChatWidgetTransportArgs): ChatWidgetTransportHandle => {
  const baseApi = buildChatCompletionsUrl(appId, agentId)
  let requestState: ChatWidgetRequestState = {}

  const transport: ChatWidgetTransport = {
    api: baseApi,
    headers: () => {
      const { algoliaAgent } = requestState
      return {
        'x-algolia-application-id': appId,
        'x-algolia-api-key': apiKey,
        ...(algoliaAgent ? { 'x-algolia-agent': `${algoliaAgent}; chat` } : {}),
      }
    },
    // connectChat strips data-* parts from `messages` after this runs.
    prepareSendMessagesRequest: ({ id, messageId, messages, trigger }) => {
      const { searchParameters } = requestState
      return {
        api:
          trigger === 'regenerate-message'
            ? buildChatCompletionsUrl(appId, agentId, true)
            : baseApi,
        body: {
          id,
          messageId,
          messages,
          ...(searchParameters ? { algolia: { searchParameters } } : {}),
        },
      }
    },
  }

  return {
    transport,
    setRequestState: (state) => {
      requestState = state
    },
  }
}

/** Reads a v5 client's user agent, which InstantSearch extends with its own. */
export const getClientAlgoliaAgent = (client: unknown): string | undefined => {
  if (!isRecord(client)) return undefined
  return typeof client._ua === 'string' ? client._ua : undefined
}
