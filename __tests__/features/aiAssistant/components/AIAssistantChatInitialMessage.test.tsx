import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AIAssistantChat } from '@/features/aiAssistant/components/AIAssistantChat'
import { initialAIMessageState } from '@/features/aiAssistant/stores/aiAssistant'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import { render } from '../../../helpers/test-utils'

const useAgentChatMock = vi.fn()
const useUploadedImageMock = vi.fn()
const useAIAssistantPanelMock = vi.fn()

vi.mock('@/features/aiAssistant/hooks/useAgentChat', () => {return {
  useAgentChat: () => useAgentChatMock(),
}})

vi.mock('@/features/aiAssistant/hooks/useUploadedImage', () => {return {
  useUploadedImage: () => useUploadedImageMock(),
}})

vi.mock('@/features/aiAssistant/hooks/ui/useAIAssistantPanel', () => {return {
  useAIAssistantPanel: () => useAIAssistantPanelMock(),
}})

// Stub the carousel so these tests don't depend on Algolia/empty-query hits.
vi.mock('@/features/aiAssistant/components/AIAssistantTrendingCarousel', () => {return {
  AIAssistantTrendingCarousel: () => <div data-testid="trending-carousel" />,
}})

const QUEUED_MESSAGE = 'what should i wear to a wedding'

describe('AIAssistantChat — queued initial message', () => {
  let sendMessageMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    sendMessageMock = vi.fn()
    useAgentChatMock.mockReturnValue({
      messages: [],
      status: 'idle',
      error: null,
      sendMessage: sendMessageMock,
      sendImageMessage: vi.fn(),
      clearError: vi.fn(),
      suggestions: [],
      streamingDisplay: null,
    })
    useUploadedImageMock.mockReturnValue({
      uploaded: null,
      error: null,
      uploadFile: vi.fn(),
      clear: vi.fn(),
    })
    useAIAssistantPanelMock.mockReturnValue({ isMobile: false })
  })

  it('sends the queued initial message exactly once when idle', () => {
    const store = createTestStore((s) => {
      s.set(initialAIMessageState, QUEUED_MESSAGE)
    })

    render(<AIAssistantChat isExpanded={false} />, { store })

    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(sendMessageMock).toHaveBeenCalledWith(QUEUED_MESSAGE, {
      orderContext: undefined,
    })
  })

  it('does not send while the assistant is in an error state', () => {
    useAgentChatMock.mockReturnValue({
      messages: [],
      status: 'error',
      error: 'Something went wrong',
      sendMessage: sendMessageMock,
      sendImageMessage: vi.fn(),
      clearError: vi.fn(),
      suggestions: [],
      streamingDisplay: null,
    })
    const store = createTestStore((s) => {
      s.set(initialAIMessageState, QUEUED_MESSAGE)
    })

    render(<AIAssistantChat isExpanded={false} />, { store })

    expect(sendMessageMock).not.toHaveBeenCalled()
  })

  it('clears the queued message on unmount so it cannot auto-send later', () => {
    useAgentChatMock.mockReturnValue({
      messages: [],
      status: 'error',
      error: 'Something went wrong',
      sendMessage: sendMessageMock,
      sendImageMessage: vi.fn(),
      clearError: vi.fn(),
      suggestions: [],
      streamingDisplay: null,
    })
    const store = createTestStore((s) => {
      s.set(initialAIMessageState, QUEUED_MESSAGE)
    })

    const { unmount } = render(<AIAssistantChat isExpanded={false} />, { store })
    unmount()

    expect(store.get(initialAIMessageState)).toBe('')
  })
})
