import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AIAssistantChat } from '@/features/aiAssistant/components/AIAssistantChat'
import { isAssistantBusyState } from '@/features/aiAssistant/stores/aiAssistant'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import { render } from '../../../helpers/test-utils'

const useAgentChatMock = vi.fn()
const useUploadedImageMock = vi.fn()
const useAIAssistantPanelMock = vi.fn()

vi.mock('@/features/aiAssistant/hooks/useAgentChat', () => {
  return {
    useAgentChat: () => useAgentChatMock(),
  }
})

vi.mock('@/features/aiAssistant/hooks/useUploadedImage', () => {
  return {
    useUploadedImage: () => useUploadedImageMock(),
  }
})

vi.mock('@/features/aiAssistant/hooks/ui/useAIAssistantPanel', () => {
  return {
    useAIAssistantPanel: () => useAIAssistantPanelMock(),
  }
})

// Stub the carousel so these tests don't depend on Algolia/empty-query hits.
vi.mock(
  '@/features/aiAssistant/components/AIAssistantTrendingCarousel',
  () => {
    return {
      AIAssistantTrendingCarousel: () => <div data-testid="trending-carousel" />,
    }
  },
)

const mockChat = (status: string) => {
  useAgentChatMock.mockReturnValue({
    messages: [],
    status,
    error: null,
    sendMessage: vi.fn(),
    sendImageMessage: vi.fn(),
    clearError: vi.fn(),
    suggestions: [],
    streamingDisplay: null,
  })
}

describe('AIAssistantChat — busy state', () => {
  beforeEach(() => {
    useUploadedImageMock.mockReturnValue({
      uploaded: null,
      error: null,
      uploadFile: vi.fn(),
      clear: vi.fn(),
    })
    useAIAssistantPanelMock.mockReturnValue({ isMobile: false })
  })

  it('marks the assistant busy while streaming', () => {
    mockChat('streaming')
    const store = createTestStore()

    render(<AIAssistantChat isExpanded={false} />, { store })

    expect(store.get(isAssistantBusyState)).toBe(true)
  })

  it('is not busy while idle', () => {
    mockChat('idle')
    const store = createTestStore()

    render(<AIAssistantChat isExpanded={false} />, { store })

    expect(store.get(isAssistantBusyState)).toBe(false)
  })

  it('clears the busy flag when the panel unmounts mid-stream', () => {
    mockChat('streaming')
    const store = createTestStore()

    const { unmount } = render(<AIAssistantChat isExpanded={false} />, { store })
    expect(store.get(isAssistantBusyState)).toBe(true)

    unmount()

    expect(store.get(isAssistantBusyState)).toBe(false)
  })
})
