'use client'

import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { ChatQueuedImageTurn } from '@/features/chatWidget/components/ChatQueuedImageTurn'
import { ChatWidgetQueuedImageContext } from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'

/** Shows the pending image turn while its analysis is prepared for Chat. */
export const ChatQueuedImageMessage = () => {
  const queuedImageMessage = useContext(ChatWidgetQueuedImageContext)
  const [messagesContainer, setMessagesContainer] =
    useState<HTMLElement | null>(null)
  const markerRef = useRef<HTMLSpanElement | null>(null)
  const updateMessagesContainer = useCallback(() => {
    const nextContainer = markerRef.current
      ?.closest('.sw-ChatWidget')
      ?.querySelector<HTMLElement>('.ais-ChatMessages-content')

    setMessagesContainer((currentContainer) =>
      currentContainer === nextContainer
        ? currentContainer
        : (nextContainer ?? null),
    )
  }, [])
  const setMarker = useCallback(
    (marker: HTMLSpanElement | null) => {
      markerRef.current = marker
      updateMessagesContainer()
    },
    [updateMessagesContainer],
  )

  // Always observe so a transcript replaced while idle (e.g. after a clear) is never stale.
  useEffect(() => {
    const widget = markerRef.current?.closest('.sw-ChatWidget')
    if (!widget) return

    const observer = new MutationObserver(updateMessagesContainer)
    observer.observe(widget, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [updateMessagesContainer])

  const imageUrl = queuedImageMessage?.imageUrl
  const queuedTurn =
    queuedImageMessage && imageUrl && messagesContainer
      ? createPortal(
          <ChatQueuedImageTurn
            text={queuedImageMessage.text}
            isImageOnly={queuedImageMessage.isImageOnly}
            imageUrl={imageUrl}
          />,
          messagesContainer,
        )
      : null

  return <span ref={setMarker}>{queuedTurn}</span>
}
