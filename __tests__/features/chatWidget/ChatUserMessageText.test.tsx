import { act, render, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { Chat, InstantSearch, type ChatHandle } from 'react-instantsearch'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { IMAGE_ONLY_MESSAGE } from '@/features/aiAssistant/constants'
import { ChatUserMessageText } from '@/features/chatWidget/components/ChatUserMessageText'
import {
  buildChatImageUserMessage,
  sendChatImageMessage,
} from '@/features/chatWidget/utils/chatImageMessage'

import type { UIMessage } from 'instantsearch.js/es/lib/chat'

const AGENT_ID = 'image-agent'
const THUMBNAIL_URL = 'data:image/jpeg;base64,VEhVTUI='
const STORAGE_KEY = `instantsearch-chat-initial-messages-${AGENT_ID}`

const SEARCH_CLIENT = {
  appId: 'APP_ID',
  apiKey: 'API_KEY',
  search: async (requests: unknown[]) => {
    return {
      results: requests.map(() => {
        return {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: '',
          params: '',
          exhaustiveNbHits: true,
        }
      }),
    }
  },
}

const SSE_RESPONSE = [
  { type: 'start', messageId: 'assistant-1' },
  { type: 'text-start', id: 't1' },
  { type: 'text-delta', id: 't1', delta: 'Here are similar items.' },
  { type: 'text-end', id: 't1' },
  { type: 'finish' },
]
  .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
  .concat('data: [DONE]\n\n')
  .join('')

const textMessage = (text: string): UIMessage => {
  return { id: 'm1', role: 'user', parts: [{ type: 'text', text }] }
}

const renderChat = (ref?: React.Ref<ChatHandle>) =>
  render(
    <InstantSearch
      searchClient={SEARCH_CLIENT as never}
      indexName="products">
      <Chat
        ref={ref}
        agentId={AGENT_ID}
        context={() => {
          return { imageAnalysis: 'red sneaker' }
        }}
        persistence={{ messages: true, open: true }}
        messagesProps={{
          userMessageProps: { textComponent: ChatUserMessageText },
        }}
      />
    </InstantSearch>,
  )

describe('ChatUserMessageText', () => {
  it('renders the attached image above the text of an image turn', () => {
    const message = {
      id: 'm1',
      role: 'user',
      ...buildChatImageUserMessage('Find this', THUMBNAIL_URL),
    } as UIMessage
    const { container } = render(
      <ChatUserMessageText
        part={{ type: 'text', text: 'Find this' }}
        message={message}
        partIndex={1}
        status="ready"
      />,
    )

    const image = screen.getByRole('img', { name: 'Uploaded image' })
    const imageWrapper = image.parentElement
    expect(image).toHaveAttribute('src', THUMBNAIL_URL)
    expect(container.firstChild).toBe(imageWrapper)
    expect(imageWrapper).toHaveClass('sw-ChatWidget-userImage')
    expect(imageWrapper?.nextSibling).toHaveTextContent('Find this')
    expect(imageWrapper?.nextSibling).toHaveClass('sw-ChatWidget-userImageText')
  })

  it('renders a text-only message without an image', () => {
    render(
      <ChatUserMessageText
        part={{ type: 'text', text: 'Show me boots' }}
        message={textMessage('Show me boots')}
        partIndex={0}
        status="ready"
      />,
    )

    const text = screen.getByText('Show me boots')
    expect(text).toHaveClass('ais-ChatMessage-text')
    expect(text).not.toHaveClass('sw-ChatWidget-userImageText')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('does not render an empty text bubble for an image-only turn', () => {
    const message = {
      id: 'm1',
      role: 'user',
      ...buildChatImageUserMessage(
        IMAGE_ONLY_MESSAGE,
        THUMBNAIL_URL,
        true,
      ),
    } as UIMessage
    const { container } = render(
      <ChatUserMessageText
        part={{ type: 'text', text: IMAGE_ONLY_MESSAGE }}
        message={message}
        partIndex={1}
        status="ready"
      />,
    )

    expect(screen.getByRole('img', { name: 'Uploaded image' })).toBeVisible()
    expect(container.querySelector('.ais-ChatMessage-text')).toBeNull()
  })

  it('renders a real caption that matches the transport placeholder', () => {
    const message = {
      id: 'm1',
      role: 'user',
      ...buildChatImageUserMessage(IMAGE_ONLY_MESSAGE, THUMBNAIL_URL),
    } as UIMessage
    render(
      <ChatUserMessageText
        part={{ type: 'text', text: IMAGE_ONLY_MESSAGE }}
        message={message}
        partIndex={1}
        status="ready"
      />,
    )

    expect(screen.getByText(IMAGE_ONLY_MESSAGE)).toBeVisible()
    expect(screen.getByRole('img', { name: 'Uploaded image' })).toBeVisible()
  })

  it('shows a fallback label when an image-only turn lost its thumbnail', () => {
    const message = {
      ...textMessage(IMAGE_ONLY_MESSAGE),
      metadata: { chatImage: { isImageOnly: true } },
    } as UIMessage
    render(
      <ChatUserMessageText
        part={{ type: 'text', text: IMAGE_ONLY_MESSAGE }}
        message={message}
        partIndex={0}
        status="ready"
      />,
    )

    expect(screen.getByText('Uploaded image')).toBeVisible()
    expect(screen.queryByText(IMAGE_ONLY_MESSAGE)).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('ignores a persisted image part that is not an image data URL', () => {
    const message = {
      id: 'm1',
      role: 'user',
      parts: [
        { type: 'data-chat-image', data: { url: 'https://evil.example/x.png' } },
        { type: 'text', text: 'Find this' },
      ],
    } as UIMessage
    render(
      <ChatUserMessageText
        part={{ type: 'text', text: 'Find this' }}
        message={message}
        partIndex={1}
        status="ready"
      />,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  describe('with the InstantSearch Chat widget', () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(SSE_RESPONSE, {
          headers: { 'content-type': 'text/event-stream' },
        }),
    )

    beforeEach(() => {
      sessionStorage.clear()
      fetchMock.mockClear()
      vi.stubGlobal('fetch', fetchMock)
      Element.prototype.scrollTo = () => {}
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      sessionStorage.clear()
    })

    it('keeps the image client-side and restores it after a reload', async () => {
      const chatRef = createRef<ChatHandle>()
      const { unmount } = renderChat(chatRef)
      await waitFor(() => expect(chatRef.current).not.toBeNull())

      act(() => {
        const chat = chatRef.current
        if (!chat) throw new Error('Chat handle is missing')
        chat.setOpen(true)
        sendChatImageMessage(
          chat,
          buildChatImageUserMessage('Find this', THUMBNAIL_URL),
        )
      })

      await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
      const body = String(fetchMock.mock.calls[0][1]?.body)
      expect(body).toContain('Find this')
      expect(body).toContain('red sneaker')
      expect(body).not.toContain('data-chat-image')
      expect(body).not.toContain(THUMBNAIL_URL)

      await screen.findByText('Here are similar items.')
      await waitFor(() =>
        expect(sessionStorage.getItem(STORAGE_KEY)).toContain(
          'Here are similar items.',
        ),
      )
      expect(sessionStorage.getItem(STORAGE_KEY)).toContain(THUMBNAIL_URL)

      unmount()
      renderChat()

      const text = await screen.findByText('Find this')
      const image = screen.getByRole('img', { name: 'Uploaded image' })
      expect(image).toHaveAttribute('src', THUMBNAIL_URL)
      expect(image.parentElement?.nextSibling).toBe(text)
      expect(screen.getByText('Here are similar items.')).toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledOnce()
    })
  })
})
