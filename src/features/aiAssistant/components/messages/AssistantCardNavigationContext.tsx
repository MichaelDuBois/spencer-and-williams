'use client'

import { createContext, useContext } from 'react'

import type { ReactNode } from 'react'

const AssistantCardNavigationContext = createContext<(() => void) | null>(null)

interface AssistantCardNavigationProviderProps {
  children: ReactNode
  onLinkClick: () => void
}

export const AssistantCardNavigationProvider = ({
  children,
  onLinkClick,
}: AssistantCardNavigationProviderProps) => (
  <AssistantCardNavigationContext.Provider value={onLinkClick}>
    {children}
  </AssistantCardNavigationContext.Provider>
)

export const useAssistantCardNavigation = () =>
  useContext(AssistantCardNavigationContext)
