import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PERSONAS } from '@/app/ecommerce/personas'
import { productVertical } from '@/features/aiAssistant/verticals/product-vertical'
import { ChatQueuedImageMessage } from '@/features/chatWidget/components/ChatQueuedImageMessage'
import { ChatWidgetQueuedImageContext } from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'
import { ChatWidgetWelcome } from '@/features/chatWidget/components/ChatWidgetWelcome'
import { track } from '@/lib/analytics/track'
import { activeConfigAtom } from '@/stores/activeConfig'
import { activePersonaAtom } from '@/stores/personalization'

import { createTestStore } from '../../helpers/jotai-wrapper'
import { createMockConfig, render, screen } from '../../helpers/test-utils'

import type { ChatComponentContext } from 'instantsearch-ui-components'

const { pathnameMock } = vi.hoisted(() => {return {
  pathnameMock: vi.fn(() => '/ecommerce/search'),
}})

vi.mock('next/navigation', () => {return { usePathname: pathnameMock }})

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

vi.mock('@/features/aiAssistant/components/AIAssistantTrendingCarousel', () => {
  return {
    AIAssistantTrendingCarousel: () => (
      <div data-testid="trending-carousel" />
    ),
  }
})

const IMAGE_URL = 'data:image/jpeg;base64,QUJD'

const buildContext = (
  sendMessage = vi.fn(),
  maximized = false,
): ChatComponentContext => {return {
  messages: [],
  status: 'ready',
  isClearing: false,
  open: true,
  maximized,
  tools: {},
  sendMessage,
  regenerate: vi.fn(),
  stop: vi.fn(),
  onReload: vi.fn(),
  onClose: vi.fn(),
}}

describe('ChatWidgetWelcome', () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue('/ecommerce/search')
    vi.mocked(track).mockClear()
  })

  it('shows the assistant carousel and sends selected starter questions', async () => {
    const sendMessage = vi.fn()
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig())
      s.set(activePersonaAtom, null)
    })
    const user = userEvent.setup()

    render(<ChatWidgetWelcome context={buildContext(sendMessage, true)} />, {
      store,
    })

    const question = productVertical.suggestedQuestions[0]
    expect(screen.getByTestId('trending-carousel')).toBeInTheDocument()
    expect(screen.getByText(productVertical.emptyStateText)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: question }))

    expect(sendMessage).toHaveBeenCalledWith({ text: question })
  })

  it('tracks a selected starter question as a chat widget suggestion click', async () => {
    const sendMessage = vi.fn()
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig())
      s.set(activePersonaAtom, null)
    })
    const user = userEvent.setup()

    render(<ChatWidgetWelcome context={buildContext(sendMessage)} />, {
      store,
    })

    const question = productVertical.suggestedQuestions[0]
    await user.click(screen.getByRole('button', { name: question }))

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('assistant_suggestion_clicked', {
      surface: 'chat_widget',
      suggestion: question,
    })
    expect(sendMessage).toHaveBeenCalledWith({ text: question })
  })

  it('hides the carousel in the side panel', () => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig())
      s.set(activePersonaAtom, null)
    })

    render(<ChatWidgetWelcome context={buildContext()} />, { store })

    expect(screen.queryByTestId('trending-carousel')).not.toBeInTheDocument()
  })

  it('uses the active persona for the greeting and starter questions', () => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig())
      s.set(activePersonaAtom, PERSONAS[0])
    })

    render(<ChatWidgetWelcome context={buildContext()} />, { store })

    expect(screen.getByText(/Welcome back, Sports Fan/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: `Show me ${PERSONAS[0].affinities.brand[0]}`,
      }),
    ).toBeInTheDocument()
  })

  it('hides the welcome state while an image turn is queued', () => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig())
      s.set(activePersonaAtom, null)
    })

    render(
      <ChatWidgetQueuedImageContext.Provider
        value={{
          text: 'Find a similar product.',
          isImageOnly: false,
          imageUrl: IMAGE_URL,
        }}>
        <ChatWidgetWelcome context={buildContext()} />
      </ChatWidgetQueuedImageContext.Provider>,
      { store },
    )

    expect(screen.queryByText(productVertical.emptyStateText)).not.toBeInTheDocument()
  })

  it('appends the queued image turn and loader to the chat transcript', async () => {
    const renderTranscript = (
      queuedImageMessage: {
        text: string
        isImageOnly: boolean
        imageUrl: string
      } | null,
    ) => (
      <div className="sw-ChatWidget">
        <div className="ais-ChatMessages-content">
          <article>Earlier message</article>
        </div>
        <ChatWidgetQueuedImageContext.Provider value={queuedImageMessage}>
          <ChatQueuedImageMessage />
        </ChatWidgetQueuedImageContext.Provider>
      </div>
    )
    const { container, rerender } = render(
      renderTranscript(null),
    )

    rerender(
      renderTranscript({
        text: 'Find a similar product.',
        isImageOnly: false,
        imageUrl: IMAGE_URL,
      }),
    )

    await screen.findByText('Find a similar product.')

    const transcript = container.querySelector(
      '.ais-ChatMessages-content',
    )
    expect(
      transcript?.querySelector('[aria-label="Analyzing image"]'),
    ).toBeInTheDocument()
  })
})
