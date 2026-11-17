'use client'

import { useAtom, useSetAtom } from 'jotai'
import { Send, AlertCircle, X, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect, useLayoutEffect } from 'react'

import { AIAssistantSuggestions } from '@/features/aiAssistant/components/AIAssistantSuggestions'
import { AIAssistantTrendingCarousel } from '@/features/aiAssistant/components/AIAssistantTrendingCarousel'
import {
  ImageUploadButton,
  ImageUploadPreview,
} from '@/features/aiAssistant/components/ImageUpload'
import { Message } from '@/features/aiAssistant/components/Message'
import { B2BContentContextCard } from '@/features/aiAssistant/components/messages/b2b-content/B2BContentContextCard'
import { FashionContentContextCard } from '@/features/aiAssistant/components/messages/fashion/FashionContentContextCard'
import { PreviousOrdersMessage } from '@/features/aiAssistant/components/messages/PreviousOrdersMessage'
import { TravelContentContextCard } from '@/features/aiAssistant/components/messages/travel/TravelContentContextCard'
import { ProductContextCard } from '@/features/aiAssistant/components/ProductContextCard'
import { SuggestionButtons } from '@/features/aiAssistant/components/SuggestionButtons'
import { ThinkingIndicator } from '@/features/aiAssistant/components/ThinkingIndicator'
import { useAIAssistantPanel } from '@/features/aiAssistant/hooks/ui/useAIAssistantPanel'
import { useAnchorScroll } from '@/features/aiAssistant/hooks/ui/useAnchorScroll'
import { useAgentChat } from '@/features/aiAssistant/hooks/useAgentChat'
import { useAssistantWelcome } from '@/features/aiAssistant/hooks/useAssistantWelcome'
import { useUploadedImage } from '@/features/aiAssistant/hooks/useUploadedImage'
import {
  followUpQueryState,
  initialAIMessageState,
  initialAITurnContextState,
  initialOrderContextState,
  isAssistantBusyState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { getVerticalConfig } from '@/features/aiAssistant/verticals/registry'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { track } from '@/lib/analytics/track'
import { cn } from '@/lib/utils'

interface AIAssistantChatProps {
  isExpanded: boolean
}

export const AIAssistantChat = ({ isExpanded }: AIAssistantChatProps) => {
  const [input, setInput] = useState('')
  const [initialMessage, setInitialMessage] = useAtom(initialAIMessageState)
  const [initialTurnContext, setInitialTurnContext] = useAtom(
    initialAITurnContextState,
  )
  const [initialOrderContext, setInitialOrderContext] = useAtom(
    initialOrderContextState,
  )
  const [followUpQuery, setFollowUpQuery] = useAtom(followUpQueryState)
  const setIsBusy = useSetAtom(isAssistantBusyState)
  const processedMessageRef = useRef<string | null>(null)
  const shouldScrollToFollowUpRef = useRef(false)
  const config = useActiveConfig()
  const verticalConfig = getVerticalConfig(config?.slug)
  const { isMobile } = useAIAssistantPanel()

  const { greetingText, starterQuestions } = useAssistantWelcome()

  // Unified chat hook - handles all verticals
  const {
    messages,
    status,
    error,
    sendMessage,
    sendImageMessage,
    clearError,
    suggestions,
    streamingDisplay,
    streamingOrders,
  } = useAgentChat()

  const isLoading =
    status === 'streaming' ||
    status === 'awaiting_tool' ||
    status === 'analyzing_image'
  const isError = status === 'error'

  // Image search: selecting a file only holds it (with a preview); nothing is
  // sent until the user presses send. On send the image is analyzed in the
  // background and the analysis is injected as hidden context — never shown.
  const {
    uploaded,
    error: uploadError,
    uploadFile,
    clear: clearUpload,
  } = useUploadedImage()

  const { containerRef, spacerRef } = useAnchorScroll({
    messages,
    isLoading,
    streamingDisplay,
  })

  // Send initial message from autocomplete AI suggestions (only once).
  // The ref guards against re-processing the same message if the effect re-fires
  // due to sendMessage getting a new reference before initialMessage clears.
  useEffect(() => {
    if (
      initialMessage &&
      initialMessage !== processedMessageRef.current &&
      status === 'idle'
    ) {
      processedMessageRef.current = initialMessage
      const orderContext = initialOrderContext ?? undefined
      const turnContext = initialTurnContext ?? undefined
      setInitialMessage('')
      setInitialTurnContext(null)
      setInitialOrderContext(null)
      sendMessage(initialMessage, { orderContext, turnContext })
    }
  }, [
    initialMessage,
    initialOrderContext,
    initialTurnContext,
    status,
    sendMessage,
    setInitialMessage,
    setInitialTurnContext,
    setInitialOrderContext,
  ])

  // Drop a queued initial message on unmount, for the same reason as the
  // follow-up below: it can be set while the assistant is in an error state,
  // and would otherwise auto-send the next time the panel opens.
  useEffect(
    () => () => {
      setInitialMessage('')
      setInitialTurnContext(null)
    },
    [setInitialMessage, setInitialTurnContext],
  )

  // Send a programmatic follow-up (e.g. "See more like this") once idle
  useEffect(() => {
    if (followUpQuery && status === 'idle') {
      const { text, excludeShown } = followUpQuery
      setFollowUpQuery(null)
      shouldScrollToFollowUpRef.current = true
      sendMessage(text, { excludeShown })
    }
  }, [followUpQuery, status, sendMessage, setFollowUpQuery])

  // Drop any queued follow-up when the panel unmounts. A follow-up can be
  // clicked while the assistant is in an error state (the button isn't busy,
  // but status !== 'idle' so the send effect can't fire); without this, that
  // stale query would auto-send on the next open, since status remounts idle.
  useEffect(() => () => setFollowUpQuery(null), [setFollowUpQuery])

  // Once the follow-up's user message has rendered, scroll it to the top
  // immediately — without waiting for the assistant's response to stream in.
  useLayoutEffect(() => {
    if (!shouldScrollToFollowUpRef.current) return
    shouldScrollToFollowUpRef.current = false
    const container = containerRef.current
    const userMessages = container?.querySelectorAll<HTMLElement>(
      '[data-message-role="user"]',
    )
    const lastUserMessage = userMessages?.[userMessages.length - 1]
    if (!container || !lastUserMessage) return
    // Align the user message near the top of the scroll viewport.
    container.scrollTop = Math.max(0, lastUserMessage.offsetTop - 16)
  }, [messages, containerRef])

  // Expose streaming state so nested components can disable themselves.
  // useLayoutEffect (not useEffect) so the busy atom is in sync before paint —
  // otherwise there's a frame where "See more like this" reads a stale
  // not-busy state and can still be clicked as a send begins streaming.
  // The cleanup matters on unmount: closing the panel mid-stream would
  // otherwise leave the atom stuck at `true`, disabling the button for any
  // consumer until the next send.
  useLayoutEffect(() => {
    setIsBusy(isLoading)
    return () => setIsBusy(false)
  }, [isLoading, setIsBusy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    // Image uploaded: send it with the optional typed text.
    if (uploaded) {
      const message = input
      setInput('')
      clearUpload()
      await sendImageMessage({
        text: message,
        imageDataUrl: uploaded.dataUrl,
        base64Image: uploaded.base64Image,
        mediaType: uploaded.mediaType,
      })
      return
    }

    // Text only.
    if (!input.trim()) return
    const message = input
    setInput('')
    await sendMessage(message)
  }

  const handleSuggestionClick = (suggestion: string) => {
    track('assistant_suggestion_clicked', {
      surface: 'ai_assistant',
      suggestion,
    })
    sendMessage(suggestion)
  }

  const streamingVerticalConfig = getVerticalConfig(streamingDisplay?.vertical)

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div
        ref={containerRef}
        className={cn(
          'scrollbar-slim min-h-0 flex-1 space-y-4 overflow-y-auto p-4',
          isExpanded && 'container mx-auto',
        )}>
        {/* Context cards - only shown in fullscreen mode, aligned right like user messages */}
        {isExpanded && <ProductContextCard />}
        {isExpanded && <TravelContentContextCard />}
        {isExpanded && <B2BContentContextCard />}
        {isExpanded && <FashionContentContextCard />}

        {messages.length === 0 && !streamingDisplay && (
          <div className="flex w-full flex-col gap-6">
            {(isExpanded || isMobile) && <AIAssistantTrendingCarousel />}
            <p className="text-muted-foreground text-sm">{greetingText}</p>
            <AIAssistantSuggestions
              questions={starterQuestions}
              onSelect={handleSuggestionClick}
              stacked={!isExpanded || isMobile}
            />
          </div>
        )}

        {/* Render messages using Message component */}
        {messages.map((message) => (
          <div
            key={message.id}
            data-message-id={message.id}
            data-message-role={message.role}>
            <Message message={message} isExpanded={isExpanded} />
          </div>
        ))}

        {/* Streaming display - shows groups progressively as separate bubbles */}
        {streamingDisplay && streamingDisplay.isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[90%]">
              {streamingVerticalConfig.renderStreamingDisplay({
                intro: streamingDisplay.intro,
                answer: streamingDisplay.answer ?? '',
                groups: streamingDisplay.groups,
                streamingGroup: streamingDisplay.streamingGroup,
                isExpanded,
              })}
            </div>
          </div>
        )}

        {/* Streaming order history - previewed live from local session
            history while the displayOrders tool input is still arriving */}
        {streamingOrders && (
          <div className="flex justify-start">
            <div className="max-w-[90%]">
              <PreviousOrdersMessage
                data={streamingOrders}
                isExpanded={isExpanded}
              />
            </div>
          </div>
        )}

        {/* Thinking indicator - only show when not streaming groups */}
        {isLoading && !streamingDisplay && !streamingOrders && (
          <div className="flex justify-start">
            <div className="text-foreground max-w-[80%] px-4 py-2">
              <ThinkingIndicator />
            </div>
          </div>
        )}

        {/* Suggestion buttons - shown after the response */}
        {suggestions.length > 0 && !isLoading && !isError && (
          <SuggestionButtons
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            disabled={isLoading}
          />
        )}

        {/* Error banner */}
        {isError && error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-card flex items-start gap-3 border p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium">Something went wrong</p>
              <p className="text-destructive/80 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="hover:bg-destructive/10 shrink-0 cursor-pointer rounded p-1 transition-colors"
              aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Spacer for anchor-based scrolling */}
        <div ref={spacerRef} className="mt-0! shrink-0" />
      </div>

      {/* Input area */}
      <div className="border-border shrink-0 border-t">
        {/* Uploaded-image preview — image is selected but not yet sent */}
        {uploaded && (
          <div className={cn('px-4 pt-4', isExpanded && 'container mx-auto')}>
            <div className="max-w-sm">
              <ImageUploadPreview
                uploaded={uploaded}
                onClear={clearUpload}
                compact
              />
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={cn('flex gap-2 p-4', isExpanded && 'container mx-auto')}>
          <ImageUploadButton disabled={isLoading} onUploadFile={uploadFile} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={verticalConfig.placeholderText}
            disabled={isLoading}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 rounded-input flex-1 border px-4 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={(!input.trim() && !uploaded) || isLoading}
            aria-label="Send"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-button cursor-pointer px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        {uploadError && (
          <p
            className={cn(
              'text-destructive px-4 pb-3 text-xs',
              isExpanded && 'container mx-auto',
            )}>
            {uploadError}
          </p>
        )}
      </div>
    </div>
  )
}
