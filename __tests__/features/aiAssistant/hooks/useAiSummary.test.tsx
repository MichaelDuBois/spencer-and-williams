import { act, renderHook, waitFor } from '@testing-library/react'
import { createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAiSummary } from '@/features/aiAssistant/hooks/useAiSummary'
import { activeConfigAtom } from '@/stores/activeConfig'

import {
  buildProvidersWrapper,
  createMockConfig,
} from '@tests/helpers/test-utils'

const { fetchAgentCompletionMock } = vi.hoisted(() => {return {
  fetchAgentCompletionMock: vi.fn(),
}})

vi.mock('@/features/aiAssistant/utils/fetchAgentCompletion', () => {return {
  fetchAgentCompletion: fetchAgentCompletionMock,
}})

const buildConfig = (appId: string, agentId: string) =>
  createMockConfig({
    algolia: {
      appId,
      apiKey: `${appId}-api-key`,
      primaryIndex: { name: `${appId}-index` },
      indices: {},
    },
    features: {
      agentStudio: { summaryAgentID: agentId },
    },
  })

describe('useAiSummary', () => {
  beforeEach(() => {
    fetchAgentCompletionMock.mockReset()
    fetchAgentCompletionMock.mockImplementation(
      ({ appId, agentId }: { appId: string; agentId: string }) =>
        Promise.resolve({
          textContent: `Summary from ${appId}/${agentId}`,
          suggestions: [],
          toolCalls: [],
          messageId: null,
        }),
    )
  })

  it('fetches from a new agent when the app and content ID are unchanged', async () => {
    const store = createStore()
    store.set(activeConfigAtom, buildConfig('shared-app', 'agent-a'))
    const { Wrapper } = buildProvidersWrapper({ store })

    const { result } = renderHook(
      () =>
        useAiSummary({
          record: { objectID: 'shared-article' },
          contentType: 'article',
        }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.summary).toBe('Summary from shared-app/agent-a')
    })

    act(() => {
      store.set(activeConfigAtom, buildConfig('shared-app', 'agent-b'))
    })

    await waitFor(() => {
      expect(result.current.summary).toBe('Summary from shared-app/agent-b')
    })
    expect(fetchAgentCompletionMock).toHaveBeenCalledTimes(2)
  })

  it('fetches from a new app when the agent and content ID are unchanged', async () => {
    const store = createStore()
    store.set(activeConfigAtom, buildConfig('app-a', 'shared-agent'))
    const { Wrapper } = buildProvidersWrapper({ store })

    const { result } = renderHook(
      () =>
        useAiSummary({
          record: { objectID: 'shared-article' },
          contentType: 'article',
        }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.summary).toBe('Summary from app-a/shared-agent')
    })

    act(() => {
      store.set(activeConfigAtom, buildConfig('app-b', 'shared-agent'))
    })

    await waitFor(() => {
      expect(result.current.summary).toBe('Summary from app-b/shared-agent')
    })
    expect(fetchAgentCompletionMock).toHaveBeenCalledTimes(2)
  })

  it('returns the stored fallback when no summary agent is available', () => {
    const store = createStore()
    store.set(activeConfigAtom, createMockConfig())
    const { Wrapper } = buildProvidersWrapper({ store })

    const { result } = renderHook(
      () =>
        useAiSummary({
          record: { objectID: 'stored-article' },
          contentType: 'article',
          fallbackSummary: '  Stored editorial summary.  ',
        }),
      { wrapper: Wrapper },
    )

    expect(result.current.summary).toBe('Stored editorial summary.')
    expect(result.current.isLoading).toBe(false)
  })
})
