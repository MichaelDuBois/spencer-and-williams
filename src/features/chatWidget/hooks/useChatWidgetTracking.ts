'use client'

import { useCallback, useRef } from 'react'

import { isChatImageOnlyMessage } from '@/features/chatWidget/utils/chatImageMessage'
import { track } from '@/lib/analytics/track'

import type { UIMessage } from 'instantsearch.js/es/lib/chat'

interface ChatFinishOptions {
  messages: UIMessage[]
}

/**
 * Tracks the Chat widget's opens and sent messages. `isOpen` is the chat's
 * state as last rendered, so it still reads closed during the click or call
 * that opens it.
 */
export const useChatWidgetTracking = (isOpen: boolean, agentId: string) => {
  // Fallback for when sessionStorage is unavailable.
  const trackedIdsByKeyRef = useRef(new Map<string, string[]>())

  const trackOpen = () => {
    if (isOpen) return
    track('assistant_opened', { surface: 'chat_widget' })
  }

  // The widget exposes no submit callback, so a sent message is read back from
  // the conversation when the agent's answer finishes. A turn can finish more
  // than once (client-side tool results resend it); the user message id keeps
  // those, and regenerated answers, from counting as new messages.
  // The widget restores its conversation per agent from sessionStorage, so the
  // tracked ids are kept there too: a regenerated answer to a restored message
  // must not count after a reload or remount either.
  // Stable per agent on purpose: the widget re-creates its chat when a prop
  // changes.
  const handleFinish = useCallback(
    ({ messages }: ChatFinishOptions) => {
      const lastUserMessage = messages.findLast(
        (message) => message.role === 'user',
      )
      if (!lastUserMessage) return

      const storageKey = getStorageKey(agentId)
      const trackedIds = new Set([
        ...readStoredIds(storageKey),
        ...(trackedIdsByKeyRef.current.get(storageKey) ?? []),
      ])
      if (trackedIds.has(lastUserMessage.id)) return

      const nextIds = [...trackedIds, lastUserMessage.id].slice(
        -MAX_TRACKED_MESSAGE_IDS,
      )
      trackedIdsByKeyRef.current.set(storageKey, nextIds)
      writeStoredIds(storageKey, nextIds)
      track('assistant_message_sent', {
        surface: 'chat_widget',
        message: getMessageText(lastUserMessage),
      })
    },
    [agentId],
  )

  return { trackOpen, handleFinish }
}

const getMessageText = (message: UIMessage): string => {
  if (isChatImageOnlyMessage(message)) return ''

  return message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('')
}

const getStorageKey = (agentId: string): string =>
  `spencer-williams-chat-widget-tracked-messages-${agentId}`

const readStoredIds = (storageKey: string): string[] => {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(storageKey) ?? '[]',
    )
    if (!Array.isArray(stored)) return []
    return stored.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

const writeStoredIds = (storageKey: string, ids: string[]): void => {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(ids))
  } catch {
    // Storage disabled or full: the in-memory ids still dedupe this mount.
  }
}

const MAX_TRACKED_MESSAGE_IDS = 200
