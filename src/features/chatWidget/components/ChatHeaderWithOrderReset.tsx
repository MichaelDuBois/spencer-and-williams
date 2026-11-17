'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import {
  chatWidgetClearHistoryState,
  chatWidgetOrderContextState,
  chatWidgetPendingOrderContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { ChatHeader } from '@/features/chatWidget/components/ChatHeader'

import type { ChatHeaderOwnProps } from 'instantsearch-ui-components'

/** Clears post-purchase context when a Chat conversation is cleared. */
export const ChatHeaderWithOrderReset = (props: ChatHeaderOwnProps) => {
  const { canClear, onClear, ...headerProps } = props
  const shouldClearHistory = useAtomValue(chatWidgetClearHistoryState)
  const setShouldClearHistory = useSetAtom(chatWidgetClearHistoryState)
  const setOrderContext = useSetAtom(chatWidgetOrderContextState)
  const setPendingOrderContext = useSetAtom(chatWidgetPendingOrderContextState)
  const hasStartedClear = useRef(false)

  useEffect(() => {
    if (!shouldClearHistory) {
      hasStartedClear.current = false
      return
    }
    if (hasStartedClear.current) return

    hasStartedClear.current = true
    if (!canClear || !onClear) {
      setShouldClearHistory(false)
      return
    }

    onClear()
    const hasReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (hasReducedMotion) setShouldClearHistory(false)
  }, [canClear, onClear, setShouldClearHistory, shouldClearHistory])

  const handleClear = onClear
    ? () => {
        setOrderContext(null)
        setPendingOrderContext(null)
        onClear()
      }
    : undefined

  return (
    <ChatHeader {...headerProps} canClear={canClear} onClear={handleClear} />
  )
}
