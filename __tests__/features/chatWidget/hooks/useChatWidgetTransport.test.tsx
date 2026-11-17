import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useChatWidgetTransport } from '@/features/chatWidget/hooks/useChatWidgetTransport'
import type { ChatWidgetTransport } from '@/features/chatWidget/utils/chatWidgetTransport'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  personalizationStore,
  resetPersonalizationAtom,
  setPersonaModeAtom,
} from '@/stores/personalization'
import { searchClientAtom } from '@/stores/searchClient'
import type { Persona } from '@/types'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '@tests/helpers/test-utils'

vi.mock('@/hooks/useRealtimeProfile', () => {
  return {
    useRealtimeProfile: () => {
      return { data: undefined }
    },
  }
})

const PERSONA: Persona = {
  type: 'persona',
  id: 'runner',
  label: 'Runner',
  description: 'Likes running gear',
  token: 'persona-runner',
  affinities: { brand: ['Nike'] },
  optionalFilters: ['brand:Nike<score=5>'],
}

interface RenderTransportOptions {
  appId?: string
  apiKey?: string
}

const renderTransport = (
  chatWidgetIndexNames?: string[],
  { appId = 'APP', apiKey = 'KEY' }: RenderTransportOptions = {},
) => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        algolia: {
          appId,
          apiKey,
          primaryIndex: { name: 'fashion_ns' },
          indices: {
            articles: { name: 'fashion_articles' },
            aiSuggestions: { name: 'ai_suggestions' },
          },
        },
        features: {
          agentStudio: { chatWidgetIndexNames },
          personalization: { enabled: true, personas: [PERSONA] },
        },
      }),
    )
    s.set(searchClientAtom, { _ua: 'Algolia (5.0.0)' } as never)
  })
  return renderHook(
    ({ agentId }: { agentId: string }) => useChatWidgetTransport(agentId),
    {
      initialProps: { agentId: 'agent-1' },
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    },
  )
}

const bodyOf = async (transport: ChatWidgetTransport | undefined) => {
  const prepared = await transport?.prepareSendMessagesRequest?.({
    id: 'chat-1',
    messageId: undefined,
    messages: [],
    trigger: 'submit-message',
    requestMetadata: undefined,
    body: undefined,
    credentials: undefined,
    headers: undefined,
    api: '',
  })
  return prepared?.body
}

describe('useChatWidgetTransport', () => {
  afterEach(() => {
    personalizationStore.set(resetPersonalizationAtom)
  })

  it('keeps one transport while the persona changes and sends the latest override', async () => {
    const { result } = renderTransport(['support_faq'])
    const initial = result.current

    expect(await bodyOf(initial)).toMatchObject({
      algolia: {
        searchParameters: {
          fashion_ns: { enablePersonalization: false },
          support_faq: { enablePersonalization: false },
        },
      },
    })

    act(() => {
      personalizationStore.set(setPersonaModeAtom, PERSONA)
    })

    expect(result.current).toBe(initial)
    const override = {
      userToken: 'persona-runner',
      enablePersonalization: true,
      optionalFilters: PERSONA.optionalFilters,
    }
    expect(await bodyOf(result.current)).toMatchObject({
      algolia: {
        searchParameters: { fashion_ns: override, support_faq: override },
      },
    })
  })

  it('sends only the primary index when no extra indices are configured', async () => {
    const { result } = renderTransport()
    const body = (await bodyOf(result.current)) as {
      algolia: { searchParameters: Record<string, unknown> }
    }

    expect(Object.keys(body.algolia.searchParameters)).toEqual(['fashion_ns'])
  })

  it('reads the chat agent from the InstantSearch client', () => {
    const { result } = renderTransport()
    const headers = result.current?.headers

    expect(typeof headers === 'function' ? headers() : headers).toMatchObject({
      'x-algolia-agent': 'Algolia (5.0.0); chat',
    })
  })

  it.each([
    ['appId', { appId: '' }],
    ['apiKey', { apiKey: '' }],
  ])('returns no transport when %s is missing', (_field, credentials) => {
    const { result } = renderTransport(undefined, credentials)

    expect(result.current).toBeUndefined()
  })

  it('creates a new transport for the new agent when agentId changes', async () => {
    const { result, rerender } = renderTransport()
    const initial = result.current

    rerender({ agentId: 'agent-2' })

    expect(result.current).not.toBe(initial)
    expect(result.current?.api).toContain('/agents/agent-2/completions')
    expect(await bodyOf(result.current)).toMatchObject({
      algolia: {
        searchParameters: { fashion_ns: { enablePersonalization: false } },
      },
    })
  })
})
