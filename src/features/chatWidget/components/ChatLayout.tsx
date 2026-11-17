'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ComponentProps,
} from 'react'
import { ChatOverlayLayout, useChatTrigger } from 'react-instantsearch'

import { MOBILE_BREAKPOINT } from '@/features/aiAssistant/constants'
import { chatWidgetClearHistoryState } from '@/features/aiAssistant/stores/aiAssistant'
import {
  ChatWidgetFullscreenContext,
  ChatWidgetPanelContext,
} from '@/features/chatWidget/components/chatWidgetPanelContext'
import { useChatWidgetMode } from '@/features/chatWidget/hooks/useChatWidgetMode'
import { getOrderDisplayMessages } from '@/features/chatWidget/utils/orderDisplayMessages'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useMediaQuery } from '@/hooks/useMediaQuery'

import type { ChatMessageBase } from 'instantsearch-ui-components'

type ChatLayoutProps = ComponentProps<typeof ChatOverlayLayout>

interface ChatMessagesElementProps {
  messages?: ChatMessageBase[]
  onClearTransitionEnd?: () => void
}

type ChatHeaderElementProps = {
  onToggleMaximize?: () => void
}

const addRootClassName = (
  rootClassName: string | string[] | undefined,
  className: string,
): string[] => [
  ...(Array.isArray(rootClassName)
    ? rootClassName
    : rootClassName
      ? [rootClassName]
      : []),
  className,
]

/**
 * Keeps the official Chat behavior while matching the app's existing panel
 * convention: dock beside content on detail/search routes and fill the screen
 * on a vertical homepage or map.
 */
export const ChatLayout = (props: ChatLayoutProps) => {
  const config = useActiveConfig()
  const shouldClearHistory = useAtomValue(chatWidgetClearHistoryState)
  const setShouldClearHistory = useSetAtom(chatWidgetClearHistoryState)
  const [isPageScrolled, setIsPageScrolled] = useState(false)
  const basePath = config ? `/${config.slug}` : ''
  const mode = useChatWidgetMode(basePath)
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)
  const { open, toggleOpen } = useChatTrigger()
  const toggleMaximize = isValidElement<ChatHeaderElementProps>(
    props.headerComponent,
  )
    ? props.headerComponent.props.onToggleMaximize
    : undefined

  // A docked panel covers the whole viewport below `lg`, so it has no width to
  // shrink to: close it outright instead, the way the custom assistant does.
  const collapsePanel = isMobile
    ? open
      ? toggleOpen
      : undefined
    : props.maximized
      ? toggleMaximize
      : undefined

  useEffect(() => {
    const updateScrollState = () => setIsPageScrolled(window.scrollY > 0)

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  const classNames = {
    ...props.classNames,
    root: addRootClassName(
      props.classNames?.root,
      [
        mode === 'fullscreen'
          ? 'sw-ChatWidget--fullscreen'
          : isPageScrolled
            ? 'sw-ChatWidget--side-panel sw-ChatWidget--scrolled'
            : 'sw-ChatWidget--side-panel',
        props.maximized && 'sw-ChatWidget--expanded',
      ]
        .filter(Boolean)
        .join(' '),
    ),
  }

  // ChatOverlayLayout drops onClearTransitionEnd, so inject it into ChatMessages.
  const originalMessagesComponent = props.messagesComponent
  const messagesComponent = isValidElement<ChatMessagesElementProps>(
    originalMessagesComponent,
  )
    ? cloneElement(originalMessagesComponent, {
        ...(originalMessagesComponent.props.messages && {
          messages: getOrderDisplayMessages(
            originalMessagesComponent.props.messages,
          ),
        }),
        onClearTransitionEnd: () => {
          originalMessagesComponent.props.onClearTransitionEnd?.()
          if (shouldClearHistory) setShouldClearHistory(false)
        },
      })
    : originalMessagesComponent

  return (
    <ChatWidgetPanelContext.Provider value={collapsePanel}>
      <ChatWidgetFullscreenContext.Provider
        value={mode === 'fullscreen' || Boolean(props.maximized)}>
        <ChatOverlayLayout
          {...props}
          classNames={classNames}
          messagesComponent={messagesComponent}
        />
      </ChatWidgetFullscreenContext.Provider>
    </ChatWidgetPanelContext.Provider>
  )
}
