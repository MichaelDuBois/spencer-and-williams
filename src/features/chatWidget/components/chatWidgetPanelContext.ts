'use client'

import { createContext, useContext } from 'react'

export const ChatWidgetFullscreenContext = createContext(false)

export const ChatWidgetPanelContext = createContext<(() => void) | undefined>(
  undefined,
)

export const useCollapseChatWidgetPanel = () =>
  useContext(ChatWidgetPanelContext)
