'use client'

import { useContext } from 'react'

import { ChatResultItem } from '@/features/chatWidget/components/ChatResultItem'
import { ChatWidgetFullscreenContext } from '@/features/chatWidget/components/chatWidgetPanelContext'

import type { ComponentProps } from 'react'

export const ChatComparisonItem = (
  props: ComponentProps<typeof ChatResultItem>,
) => {
  const isFullscreen = useContext(ChatWidgetFullscreenContext)
  return <ChatResultItem {...props} compact={isFullscreen} />
}
