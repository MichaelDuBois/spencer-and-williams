import { describe, expect, it, vi } from 'vitest'

import { IMAGE_ONLY_MESSAGE } from '@/features/aiAssistant/constants'
import {
  buildChatImageUserMessage,
  getChatMessageImageUrl,
  isChatImageOnlyMessage,
  sendChatImageMessage,
} from '@/features/chatWidget/utils/chatImageMessage'

import type { ChatHandle } from 'react-instantsearch'

const IMAGE_URL = 'data:image/jpeg;base64,VEhVTUI='

describe('chatImageMessage', () => {
  it('builds a user message with the image as a data part before the text', () => {
    expect(buildChatImageUserMessage('Find this', IMAGE_URL)).toEqual({
      metadata: { chatImage: { isImageOnly: false } },
      parts: [
        { type: 'data-chat-image', data: { url: IMAGE_URL } },
        { type: 'text', text: 'Find this' },
      ],
    })
  })

  it('stores and reads image-only state independently of the text', () => {
    const captioned = buildChatImageUserMessage(IMAGE_ONLY_MESSAGE, IMAGE_URL)
    const imageOnly = buildChatImageUserMessage(
      IMAGE_ONLY_MESSAGE,
      IMAGE_URL,
      true,
    )

    expect(isChatImageOnlyMessage(captioned)).toBe(false)
    expect(isChatImageOnlyMessage(imageOnly)).toBe(true)
    expect(isChatImageOnlyMessage({ metadata: { chatImage: null } })).toBe(false)
  })

  it('sends the full message through the Chat handle', () => {
    const chat: ChatHandle = {
      sendMessage: vi.fn(),
      setOpen: vi.fn(),
      setInput: vi.fn(),
    }
    const message = buildChatImageUserMessage('Find this', IMAGE_URL)

    sendChatImageMessage(chat, message)

    expect(chat.sendMessage).toHaveBeenCalledExactlyOnceWith(message)
  })

  it('reads the image only for the first text part', () => {
    const message = {
      parts: [
        ...buildChatImageUserMessage('Find this', IMAGE_URL).parts,
        { type: 'text', text: 'More' },
      ],
    }

    expect(getChatMessageImageUrl(message, 1)).toBe(IMAGE_URL)
    expect(getChatMessageImageUrl(message, 2)).toBeNull()
  })

  it('returns null for text-only and malformed messages', () => {
    expect(
      getChatMessageImageUrl({ parts: [{ type: 'text', text: 'Hi' }] }, 0),
    ).toBeNull()
    expect(
      getChatMessageImageUrl(
        {
          parts: [
            { type: 'data-chat-image', data: { url: 42 } },
            { type: 'text', text: 'Hi' },
          ],
        },
        1,
      ),
    ).toBeNull()
  })
})
