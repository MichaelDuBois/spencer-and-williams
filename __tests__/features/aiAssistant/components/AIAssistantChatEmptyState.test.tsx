import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AIAssistantChat } from '@/features/aiAssistant/components/AIAssistantChat'
import { productVertical } from '@/features/aiAssistant/verticals/product-vertical'

import { render, screen } from '../../../helpers/test-utils'

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

// Stub the carousel so the gate test doesn't depend on Algolia/empty-query hits.
vi.mock('@/features/aiAssistant/components/AIAssistantTrendingCarousel', () => {return {
  AIAssistantTrendingCarousel: () => <div data-testid="trending-carousel" />,
}})

const TRENDING_TESTID = 'trending-carousel'
const firstSuggestion = productVertical.suggestedQuestions[0]

const getSuggestion = () =>
  screen.queryByRole('button', { name: firstSuggestion })

describe('AIAssistantChat — empty state', () => {
  beforeEach(() => {
    useAgentChatMock.mockReturnValue({
      messages: [],
      status: 'idle',
      error: null,
      sendMessage: vi.fn(),
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

  it('hides the trending carousel in the side panel but shows suggestions', () => {
    useAIAssistantPanelMock.mockReturnValue({ isMobile: false })

    render(<AIAssistantChat isExpanded={false} />)

    expect(screen.queryByTestId(TRENDING_TESTID)).not.toBeInTheDocument()
    expect(getSuggestion()).toBeInTheDocument()
  })

  it('shows the trending carousel and suggestions when expanded', () => {
    useAIAssistantPanelMock.mockReturnValue({ isMobile: false })

    render(<AIAssistantChat isExpanded={true} />)

    expect(screen.getByTestId(TRENDING_TESTID)).toBeInTheDocument()
    expect(getSuggestion()).toBeInTheDocument()
  })

  it('shows the trending carousel and suggestions on mobile even when not expanded', () => {
    useAIAssistantPanelMock.mockReturnValue({ isMobile: true })

    render(<AIAssistantChat isExpanded={false} />)

    expect(screen.getByTestId(TRENDING_TESTID)).toBeInTheDocument()
    expect(getSuggestion()).toBeInTheDocument()
  })
})
