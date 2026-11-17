import { act, fireEvent } from '@testing-library/react'
import { StrictMode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AIAssistantChat } from '@/features/aiAssistant/components/AIAssistantChat'
import {
  followUpQueryState,
  initialAIMessageState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { productVertical } from '@/features/aiAssistant/verticals/product-vertical'
import { track } from '@/lib/analytics/track'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import { render, screen } from '../../../helpers/test-utils'

const useAgentChatMock = vi.fn()
const sendMessageMock = vi.fn()

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

vi.mock('@/features/aiAssistant/hooks/useAgentChat', () => {
  return { useAgentChat: () => useAgentChatMock() }
})

vi.mock('@/features/aiAssistant/hooks/useUploadedImage', () => {
  return {
    useUploadedImage: () => {
      return { uploaded: null, error: null, uploadFile: vi.fn(), clear: vi.fn() }
    },
  }
})

vi.mock('@/features/aiAssistant/hooks/ui/useAIAssistantPanel', () => {
  return { useAIAssistantPanel: () => {return { isMobile: false }} }
})

vi.mock(
  '@/features/aiAssistant/components/AIAssistantTrendingCarousel',
  () => {
    return { AIAssistantTrendingCarousel: () => null }
  },
)

const mockChat = (suggestions: string[] = []) => {
  useAgentChatMock.mockReturnValue({
    messages: [],
    status: 'idle',
    error: null,
    sendMessage: sendMessageMock,
    sendImageMessage: vi.fn(),
    clearError: vi.fn(),
    suggestions,
    streamingDisplay: null,
  })
}

const submitText = (text: string) => {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: text } })
  fireEvent.submit(screen.getByRole('textbox').closest('form')!)
}

// `assistant_message_sent` is tracked inside `sendMessage` (see the
// useAgentChat suite), so a sent message shows up here as one sendMessage call.
describe('AIAssistantChat — tracking', () => {
  beforeEach(() => {
    vi.mocked(track).mockClear()
    sendMessageMock.mockClear()
    mockChat()
  })

  it('sends the typed message on submit', () => {
    render(<AIAssistantChat isExpanded={false} />)

    submitText('do you sell tents?')

    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(sendMessageMock).toHaveBeenCalledWith('do you sell tents?')
    expect(track).not.toHaveBeenCalled()
  })

  it('does not send a blank submit', () => {
    render(<AIAssistantChat isExpanded={false} />)

    submitText('   ')

    expect(sendMessageMock).not.toHaveBeenCalled()
    expect(track).not.toHaveBeenCalled()
  })

  it('tracks a starter question as a suggestion click and sends it', () => {
    const suggestion = productVertical.suggestedQuestions[0]
    render(<AIAssistantChat isExpanded={false} />)

    fireEvent.click(screen.getByRole('button', { name: suggestion }))

    expect(sendMessageMock).toHaveBeenCalledWith(suggestion)
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('assistant_suggestion_clicked', {
      surface: 'ai_assistant',
      suggestion,
    })
  })

  it('tracks a follow-up suggestion as a suggestion click and sends it', () => {
    mockChat(['Show me cheaper ones'])
    render(<AIAssistantChat isExpanded={false} />)

    fireEvent.click(screen.getByRole('button', { name: 'Show me cheaper ones' }))

    expect(sendMessageMock).toHaveBeenCalledWith('Show me cheaper ones')
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('assistant_suggestion_clicked', {
      surface: 'ai_assistant',
      suggestion: 'Show me cheaper ones',
    })
  })

  describe('hand-offs', () => {
    const HANDED_OFF = 'do you sell tents?'

    it('sends a message handed off from an entry point once', () => {
      const store = createTestStore((s) => s.set(initialAIMessageState, HANDED_OFF))

      const { rerender } = render(<AIAssistantChat isExpanded={false} />, {
        store,
      })
      rerender(<AIAssistantChat isExpanded={true} />)

      expect(sendMessageMock).toHaveBeenCalledTimes(1)
      expect(sendMessageMock).toHaveBeenCalledWith(HANDED_OFF, {
        orderContext: undefined,
      })
    })

    it('sends a handed-off message once under StrictMode double effects', () => {
      const store = createTestStore((s) => s.set(initialAIMessageState, HANDED_OFF))

      render(
        <StrictMode>
          <AIAssistantChat isExpanded={false} />
        </StrictMode>,
        { store },
      )

      expect(sendMessageMock).toHaveBeenCalledTimes(1)
    })

    it('sends a "See more like this" follow-up once', () => {
      const store = createTestStore()
      const { rerender } = render(<AIAssistantChat isExpanded={false} />, {
        store,
      })

      act(() =>
        store.set(followUpQueryState, {
          text: 'Show me more like Trail Runners',
          excludeShown: true,
        }),
      )
      rerender(<AIAssistantChat isExpanded={true} />)

      expect(sendMessageMock).toHaveBeenCalledTimes(1)
      expect(sendMessageMock).toHaveBeenCalledWith(
        'Show me more like Trail Runners',
        { excludeShown: true },
      )
    })

    it('does not route a typed message through the hand-off effect', () => {
      const store = createTestStore()
      render(<AIAssistantChat isExpanded={false} />, { store })

      submitText('any in red?')

      expect(store.get(initialAIMessageState)).toBe('')
      expect(store.get(followUpQueryState)).toBeNull()
      expect(sendMessageMock).toHaveBeenCalledTimes(1)
    })
  })
})
