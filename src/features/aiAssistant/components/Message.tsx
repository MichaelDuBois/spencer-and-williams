'use client'

import { motion } from 'motion/react'

import { SuggestActionsMessage } from '@/features/aiAssistant/components/messages/b2b-content/SuggestActionsMessage'
import { ChatImageMessage } from '@/features/aiAssistant/components/messages/ChatImageMessage'
import { DisplayResultsMessage } from '@/features/aiAssistant/components/messages/DisplayResultsMessage'
import { PreviousOrdersMessage } from '@/features/aiAssistant/components/messages/PreviousOrdersMessage'
import { TextMessage } from '@/features/aiAssistant/components/messages/TextMessage'
import { OrderContextCard } from '@/features/aiAssistant/components/OrderContextCard'
import type { ChatMessage } from '@/features/aiAssistant/types'
import { EASE_SMOOTH } from '@/lib/animations'
import { cn } from '@/lib/utils'

const messageVariants = {
  initial: (role: 'user' | 'assistant') => {
    return {
      opacity: 0,
      x: role === 'user' ? 12 : -12,
      y: 4,
    }
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.25, ease: EASE_SMOOTH },
  },
}

interface MessageProps {
  message: ChatMessage
  isExpanded?: boolean
}

/**
 * Main message component with switch statement for tool types.
 * Renders different components based on message part types.
 * Uses the 'vertical' field in displayData to determine which UI to render.
 *
 * To add a new tool:
 * 1. Add new type to MessagePart.type in types
 * 2. Create new component in messages/
 * 3. Add case to switch below
 */
export const Message = ({ message, isExpanded = false }: MessageProps) => {
  // Check if message has display_results
  const hasDisplayResults = message.parts.some(
    (p) => p.type === 'display_results',
  )
  const hasSuggestActions = message.parts.some(
    (p) => p.type === 'suggest_actions',
  )
  const hasOrderHistory = message.parts.some((p) => p.type === 'order_history')
  const hasImage = message.parts.some((p) => p.type === 'image' && p.imageUrl)
  // Check if message has any actual text content
  const hasTextContent = message.parts.some((p) => p.type === 'text' && p.text)

  // Skip empty assistant messages (placeholder while streaming)
  if (
    message.role === 'assistant' &&
    !hasDisplayResults &&
    !hasSuggestActions &&
    !hasOrderHistory &&
    !hasTextContent
  ) {
    return null
  }

  // Assistant message with tool results - no animation since content was already streamed
  if (
    message.role === 'assistant' &&
    (hasDisplayResults || hasSuggestActions || hasOrderHistory)
  ) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] space-y-3">
          {message.parts.map((part, index) => {
            switch (part.type) {
              case 'text':
                if (!part.text) return null
                return (
                  <div
                    key={index}
                    className="bg-muted text-foreground rounded-card px-4 py-2">
                    <span className="text-sm whitespace-pre-wrap">
                      {part.text}
                    </span>
                  </div>
                )

              case 'display_results':
                if (!part.displayData) return null
                return (
                  <DisplayResultsMessage
                    key={index}
                    data={part.displayData}
                    isExpanded={isExpanded}
                  />
                )

              case 'order_history':
                if (!part.orderHistoryData) return null
                return (
                  <PreviousOrdersMessage
                    key={index}
                    data={part.orderHistoryData}
                    isExpanded={isExpanded}
                  />
                )

              case 'suggest_actions':
                if (!part.suggestActionsData?.length && !part.gartnerQuadrant)
                  return null
                return (
                  <div key={index}>
                    <SuggestActionsMessage
                      actions={part.suggestActionsData ?? []}
                      gartnerQuadrant={part.gartnerQuadrant}
                    />
                  </div>
                )

              default:
                return null
            }
          })}
        </div>
      </div>
    )
  }

  // Check for order context (shown above user message)
  const orderContextPart = message.parts.find((p) => p.type === 'order_context')
  const textPart = message.parts.find((p) => p.type === 'text' && p.text)

  // User message with order context - special layout
  if (message.role === 'user' && orderContextPart?.orderContext) {
    return (
      <motion.div
        className="flex flex-col items-end"
        variants={messageVariants}
        initial="initial"
        animate="animate"
        custom={message.role}>
        <div className="max-w-[90%]">
          <OrderContextCard data={orderContextPart.orderContext} />
          {textPart?.text && (
            <TextMessage text={textPart.text} role={message.role} />
          )}
        </div>
      </motion.div>
    )
  }

  // Regular message (user or simple assistant text). Parts stack vertically so
  // an uploaded image thumbnail sits above its text (image-search flow).
  const isImageTurn = message.role === 'user' && hasImage
  const messageContent = message.parts.map((part, index) => {
    switch (part.type) {
      case 'image':
        if (!part.imageUrl) return null
        return (
          <ChatImageMessage
            key={index}
            imageUrl={part.imageUrl}
            className={isImageTurn ? 'w-48 max-w-full' : undefined}
          />
        )

      case 'text':
        if (!part.text) return null
        return <TextMessage key={index} text={part.text} role={message.role} />

      // image_context is hidden agent context and never rendered.
      default:
        return null
    }
  })

  return (
    <motion.div
      className={cn(
        'flex flex-col',
        message.role === 'user' ? 'items-end' : 'items-start',
      )}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      custom={message.role}>
      {messageContent}
    </motion.div>
  )
}
