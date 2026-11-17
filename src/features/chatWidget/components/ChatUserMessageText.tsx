'use client'

import { ChatImageThumbnail } from '@/features/chatWidget/components/ChatImageThumbnail'
import {
  getChatMessageImageUrl,
  isChatImageOnlyMessage,
} from '@/features/chatWidget/utils/chatImageMessage'
import { cn } from '@/lib/utils'

import type { ChatMessageTextComponentProps } from 'instantsearch-ui-components'

/** Renders a user text part, preceded by the turn's attached image when it has one. */
export const ChatUserMessageText = ({
  part,
  message,
  partIndex,
}: ChatMessageTextComponentProps) => {
  const imageUrl = getChatMessageImageUrl(message, partIndex)
  const isImageOnly = isChatImageOnlyMessage(message)

  // A restored image-only turn can lose its thumbnail; keep the turn visible.
  if (isImageOnly && !imageUrl) {
    return <p className="ais-ChatMessage-text">{MISSING_IMAGE_LABEL}</p>
  }

  return (
    <>
      {imageUrl && <ChatImageThumbnail src={imageUrl} />}
      {!isImageOnly && (
        <p
          className={cn(
            'ais-ChatMessage-text',
            imageUrl && 'sw-ChatWidget-userImageText',
          )}>
          {part.text}
        </p>
      )}
    </>
  )
}

const MISSING_IMAGE_LABEL = 'Uploaded image'
