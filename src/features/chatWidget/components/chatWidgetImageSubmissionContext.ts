'use client'

import { createContext } from 'react'

interface ChatWidgetImagePayload {
  base64Image: string
  mediaType: string
}

export type ChatWidgetImageSubmission = ChatWidgetImagePayload &
  ({ kind: 'image-only' } | { kind: 'captioned'; text: string })

export interface QueuedImageMessage {
  text: string
  isImageOnly: boolean
  // The sent turn's thumbnail; null until it has been created.
  imageUrl: string | null
}

export const ChatWidgetImageSubmissionContext = createContext<{
  // Resolves once the analyzed image turn has been sent to Chat.
  submitImage: (image: ChatWidgetImageSubmission) => Promise<void>
} | null>(null)

export const ChatWidgetQueuedImageContext =
  createContext<QueuedImageMessage | null>(null)
