import { isRecord } from '@/utilities/isRecord'

import type { ChatHandle } from 'react-instantsearch'

// connectChat strips `data-*` parts from the request, so the image stays client-side.
export const CHAT_IMAGE_PART_TYPE = 'data-chat-image'

export interface ChatImagePart {
  type: typeof CHAT_IMAGE_PART_TYPE
  data: { url: string }
}

interface ChatTextPart {
  type: 'text'
  text: string
}

export interface ChatImageUserMessage {
  metadata: ChatImageMessageMetadata
  parts: [ChatImagePart, ChatTextPart]
}

interface ChatMessageWithParts {
  metadata?: unknown
  parts: ReadonlyArray<unknown>
}

interface ChatImageMessageMetadata {
  chatImage: { isImageOnly: boolean }
}

export const buildChatImageUserMessage = (
  text: string,
  imageUrl: string,
  isImageOnly = false,
): ChatImageUserMessage => {
  return {
    metadata: { chatImage: { isImageOnly } },
    parts: [
      { type: CHAT_IMAGE_PART_TYPE, data: { url: imageUrl } },
      { type: 'text', text },
    ],
  }
}

/** Reads the explicit image-only state without treating a real caption as a sentinel. */
export const isChatImageOnlyMessage = (
  message: Pick<ChatMessageWithParts, 'metadata'>,
): boolean => {
  const metadata = message.metadata
  if (!isRecord(metadata) || !isRecord(metadata.chatImage)) return false

  return metadata.chatImage.isImageOnly === true
}

// ChatHandle forwards the whole message to the connector; its type only lists `text`.
export const sendChatImageMessage = (
  chat: ChatHandle,
  message: ChatImageUserMessage,
): void => {
  const sendMessage = chat.sendMessage as unknown as (
    message: ChatImageUserMessage,
  ) => void
  sendMessage(message)
}

const isChatImagePart = (part: unknown): part is ChatImagePart =>
  isRecord(part) &&
  part.type === CHAT_IMAGE_PART_TYPE &&
  isRecord(part.data) &&
  typeof part.data.url === 'string' &&
  part.data.url.startsWith('data:image/')

/** Returns the attached image URL when `partIndex` is the message's first text part. */
export const getChatMessageImageUrl = (
  message: ChatMessageWithParts,
  partIndex: number,
): string | null => {
  const firstTextIndex = message.parts.findIndex(
    (part) => isRecord(part) && part.type === 'text',
  )
  if (firstTextIndex !== partIndex) return null

  const imagePart = message.parts.find(isChatImagePart)
  return imagePart?.data.url ?? null
}
