'use client'

import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useAssistantCardNavigation } from '@/features/aiAssistant/components/messages/AssistantCardNavigationContext'
import { MOBILE_BREAKPOINT } from '@/features/aiAssistant/constants'
import {
  isAIAssistantExpandedState,
  isAIAssistantOpenState,
} from '@/features/aiAssistant/stores/aiAssistant'
import type { QueryAttribution } from '@/features/aiAssistant/types'
import { useInsightsEvents } from '@/hooks/useInsightsEvents'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { track } from '@/lib/analytics/track'

/**
 * Gets the panel out of the way of whatever a card in an answer opens — a route,
 * or the media detail sheet.
 * On mobile: closes the panel entirely, since it has no docked width to shrink to.
 * On desktop: collapses the expanded panel back to sidebar mode. Pass a result
 * ID to record navigation from an assistant answer.
 *
 * Product cards additionally pass the search attribution they were displayed
 * with, opting the click into the same product-click event the search results
 * page emits. Content-only cards omit it and keep the Amplitude-only event.
 */
export const useAssistantLinkClick = (
  objectID?: string,
  attribution?: QueryAttribution,
) => {
  const override = useAssistantCardNavigation()
  const setIsOpen = useSetAtom(isAIAssistantOpenState)
  const setIsExpanded = useSetAtom(isAIAssistantExpandedState)
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)
  const { sendProductClickEvent } = useInsightsEvents()

  const hasAttribution = attribution !== undefined
  const queryID = attribution?.queryID
  const position = attribution?.position

  const handleAssistantLinkClick = useCallback(() => {
    if (objectID) {
      track('assistant_result_clicked', { surface: 'ai_assistant', objectID })
      if (hasAttribution) {
        sendProductClickEvent(
          {
            objectID,
            __queryID: queryID,
            __position: position,
          },
          { surface: 'ai_assistant' },
        )
      }
    }
    if (isMobile) {
      setIsOpen(false)
    }
    setIsExpanded(false)
  }, [
    hasAttribution,
    queryID,
    position,
    isMobile,
    objectID,
    sendProductClickEvent,
    setIsOpen,
    setIsExpanded,
  ])

  return override ?? handleAssistantLinkClick
}
