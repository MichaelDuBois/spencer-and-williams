'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { usePathname } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Chat, type ChatHandle, useChatTrigger } from 'react-instantsearch'
// Loaded here because three verticals never mount AutocompleteWidget.
import 'instantsearch.css/themes/satellite.css'

import { IMAGE_ONLY_MESSAGE } from '@/features/aiAssistant/constants'
import { useShopperContext } from '@/features/aiAssistant/hooks/useShopperContext'
import { analyzeImage } from '@/features/aiAssistant/services/imageAnalysisService'
import {
  chatWidgetClearHistoryState,
  viewerContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { ChatHeaderWithOrderReset } from '@/features/chatWidget/components/ChatHeaderWithOrderReset'
import { ChatLayout } from '@/features/chatWidget/components/ChatLayout'
import { ChatPrompt } from '@/features/chatWidget/components/ChatPrompt'
import { ChatQueuedImageMessage } from '@/features/chatWidget/components/ChatQueuedImageMessage'
import { ChatResultItem } from '@/features/chatWidget/components/ChatResultItem'
import { ChatUserMessageText } from '@/features/chatWidget/components/ChatUserMessageText'
import {
  ChatWidgetImageSubmissionContext,
  ChatWidgetQueuedImageContext,
  type ChatWidgetImageSubmission,
  type QueuedImageMessage,
} from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'
import { ChatWidgetLeadingContext } from '@/features/chatWidget/components/ChatWidgetLeadingContext'
import { ChatWidgetSuggestions } from '@/features/chatWidget/components/ChatWidgetSuggestions'
import { ChatWidgetWelcome } from '@/features/chatWidget/components/ChatWidgetWelcome'
import { useChatWidgetMode } from '@/features/chatWidget/hooks/useChatWidgetMode'
import { useChatWidgetTracking } from '@/features/chatWidget/hooks/useChatWidgetTracking'
import { useChatWidgetTransport } from '@/features/chatWidget/hooks/useChatWidgetTransport'
import { useChatWidgetTurnContext } from '@/features/chatWidget/hooks/useChatWidgetTurnContext'
import { createChatWidgetTools } from '@/features/chatWidget/tools'
import {
  buildChatImageUserMessage,
  sendChatImageMessage,
} from '@/features/chatWidget/utils/chatImageMessage'
import { createImageThumbnail } from '@/features/chatWidget/utils/createImageThumbnail'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import {
  chatWidgetEnabledAtom,
  chatWidgetOpenAtom,
  chatWidgetPendingMessageAtom,
  demoOptionsStore,
} from '@/stores/demoOptions'

export const InstantSearchChatWidget = () => {
  const config = useActiveConfig()
  const chatWidgetEnabled = useAtomValue(chatWidgetEnabledAtom, {
    store: demoOptionsStore,
  })
  const agentId = config?.features.agentStudio.chatWidgetAgentID

  if (!agentId) return null

  // Stay mounted (just hidden) while the custom assistant is active so the
  // conversation survives demo-mode switches. Mounting is cheap: the chat
  // connector makes no Agent Studio request until the first message is sent.
  return (
    <div hidden={!chatWidgetEnabled}>
      <ChatWidget agentId={agentId} basePath={`/${config.slug}`} />
    </div>
  )
}

interface ChatWidgetProps {
  agentId: string
  basePath: string
}

const ChatWidget = ({ agentId, basePath }: ChatWidgetProps) => {
  const chatWidgetEnabled = useAtomValue(chatWidgetEnabledAtom, {
    store: demoOptionsStore,
  })
  const pathname = usePathname()
  const [pendingMessage, setPendingMessage] = useAtom(
    chatWidgetPendingMessageAtom,
  )
  const viewerContext = useAtomValue(viewerContextState)
  const shouldClearHistory = useAtomValue(chatWidgetClearHistoryState)
  const { getOrders, getShopperContext, personaKey } =
    useShopperContext(viewerContext)
  const setChatWidgetOpen = useSetAtom(chatWidgetOpenAtom)
  const { open, openChat, toggleOpen, isChatBusy } = useChatTrigger()
  const chatRef = useRef<ChatHandle>(null)
  const isChatBusyRef = useRef(isChatBusy)
  const { trackOpen, handleFinish } = useChatWidgetTracking(open, agentId)
  const trackPendingOpen = useEffectEvent(trackOpen)
  const chatWidgetMode = useChatWidgetMode(basePath)
  const wasFullscreenRef = useRef(chatWidgetMode === 'fullscreen')
  const navigationState = useMemo(() => {
    return { isEnabled: chatWidgetEnabled, mode: chatWidgetMode }
  }, [chatWidgetEnabled, chatWidgetMode])
  const { getTurnContext, setImageAnalysis, clearImageAnalysis } =
    useChatWidgetTurnContext(pathname, getShopperContext)
  const [queuedImageMessage, setQueuedImageMessage] =
    useState<QueuedImageMessage | null>(null)
  // Chat stays `ready` during analysis, so other sends must wait for the image turn.
  const isImageAnalysisPending = queuedImageMessage !== null
  const handleImageSubmit = useCallback(
    async (submission: ChatWidgetImageSubmission) => {
      const { base64Image, mediaType } = submission
      const isImageOnly = submission.kind === 'image-only'
      const text = isImageOnly ? IMAGE_ONLY_MESSAGE : submission.text
      const imageUrl = `data:${mediaType};base64,${base64Image}`
      const queuedMessage: QueuedImageMessage = {
        text,
        isImageOnly,
        imageUrl: null,
      }
      setQueuedImageMessage(queuedMessage)
      try {
        const [rawAnalysis, thumbnailUrl] = await Promise.all([
          analyzeImage({ base64Image, mediaType }),
          createImageThumbnail(imageUrl).then((url) => {
            // The queued turn shows the thumbnail the sent turn will, so nothing swaps on send.
            setQueuedImageMessage((current) =>
              current === queuedMessage
                ? { text, isImageOnly, imageUrl: url }
                : current,
            )
            return url
          }),
        ])
        const analysis = rawAnalysis.trim()
        if (!analysis) throw new Error('Image analysis did not return a result')
        const chat = chatRef.current
        if (!chat || isChatBusyRef.current) {
          throw new Error('Chat did not accept the image message')
        }
        setImageAnalysis(analysis, isImageOnly)
        chat.setOpen(true)
        // Chat resolves the turn context synchronously, consuming the analysis.
        sendChatImageMessage(
          chat,
          buildChatImageUserMessage(text, thumbnailUrl, isImageOnly),
        )
      } catch (error) {
        clearImageAnalysis()
        throw error
      } finally {
        setQueuedImageMessage(null)
      }
    },
    [clearImageAnalysis, setImageAnalysis],
  )
  const imageSubmission = useMemo(() => {
    return { submitImage: handleImageSubmit }
  }, [handleImageSubmit])
  const transport = useChatWidgetTransport(agentId)
  // Persona changes must still recreate the chat tools.
  const tools = useMemo(
    () => createChatWidgetTools({ getOrders }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getOrders, personaKey],
  )

  useLayoutEffect(() => {
    isChatBusyRef.current = isChatBusy
  }, [isChatBusy])

  useEffect(() => {
    setChatWidgetOpen(open)
    return () => setChatWidgetOpen(false)
  }, [open, setChatWidgetOpen])

  // A side-panel conversation must not turn into a full-screen takeover just
  // because navigation reaches a fullscreen route. AI Mode remains the
  // deliberate entry point for full mode.
  useEffect(() => {
    const navigatedToFullscreen =
      navigationState.mode === 'fullscreen' && !wasFullscreenRef.current
    wasFullscreenRef.current = navigationState.mode === 'fullscreen'

    if (navigationState.isEnabled && navigatedToFullscreen && open) toggleOpen()
  }, [navigationState, open, toggleOpen])

  useEffect(() => {
    if (
      !chatWidgetEnabled ||
      pendingMessage === null ||
      isChatBusy ||
      isImageAnalysisPending ||
      shouldClearHistory
    )
      return

    // `openChat` returns false when it opens an empty conversation (there is
    // no message to submit). That is still a successful AI Mode click, so the
    // bridge must be cleared in either case or a later empty click can't emit
    // a new state change.
    trackPendingOpen()
    const isSent = openChat({ message: pendingMessage, referer: 'ai-mode' })
    // A refused message means Chat just got busy (e.g. the image turn); retry once it is idle.
    if (!isSent && pendingMessage.trim()) return
    setPendingMessage(null)
  }, [
    pendingMessage,
    chatWidgetEnabled,
    openChat,
    isChatBusy,
    isImageAnalysisPending,
    setPendingMessage,
    shouldClearHistory,
  ])

  return (
    <>
      <ChatWidgetImageSubmissionContext.Provider value={imageSubmission}>
        <ChatWidgetQueuedImageContext.Provider value={queuedImageMessage}>
          <Chat
            ref={chatRef}
            agentId={agentId}
            transport={transport}
            feedback={true}
            itemComponent={ChatResultItem}
            onFinish={handleFinish}
            layoutComponent={ChatLayout}
            promptComponent={ChatPrompt}
            promptHeaderComponent={ChatQueuedImageMessage}
            emptyComponent={ChatWidgetWelcome}
            suggestionsComponent={ChatWidgetSuggestions}
            userMessageLeadingComponent={ChatWidgetLeadingContext}
            messagesProps={MESSAGES_PROPS}
            context={getTurnContext}
            tools={tools}
            persistence={{ messages: true, open: true }}
            headerComponent={ChatHeaderWithOrderReset}
            classNames={{
              root: 'sw-ChatWidget',
              container: 'sw-ChatWidget-container',
              header: { root: 'sw-ChatWidget-header' },
              messages: { root: 'sw-ChatWidget-messages' },
              prompt: { root: 'sw-ChatWidget-prompt' },
            }}
            translations={{
              header: { title: 'AI Assistant' },
              prompt: { textareaPlaceholder: 'Ask anything…' },
            }}
          />
        </ChatWidgetQueuedImageContext.Provider>
      </ChatWidgetImageSubmissionContext.Provider>
    </>
  )
}

const MESSAGES_PROPS = {
  userMessageProps: { textComponent: ChatUserMessageText },
}
