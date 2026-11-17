'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useLayoutEffect, useRef } from 'react'

import { usePageContext } from '@/features/aiAssistant/hooks/usePageContext'
import {
  chatWidgetPendingOrderContextState,
  chatWidgetPendingTurnContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import type { TurnContext } from '@/features/aiAssistant/types'
import {
  buildImageContext,
  type ImageContext,
} from '@/features/aiAssistant/utils/buildImageContext'
import { buildOrderContextNote } from '@/features/aiAssistant/utils/buildOrderContext'

interface UseChatWidgetTurnContextResult {
  getTurnContext: () => TurnContext
  setImageAnalysis: (analysis: string, isImageOnly: boolean) => void
  clearImageAnalysis: () => void
}

/** Builds stable context callbacks without resetting the Chat conversation. */
export const useChatWidgetTurnContext = (
  pathname: string,
  getShopperContext: () => string | null,
): UseChatWidgetTurnContextResult => {
  const pendingOrderContext = useAtomValue(chatWidgetPendingOrderContextState)
  const pendingTurnContext = useAtomValue(chatWidgetPendingTurnContextState)
  const setPendingOrderContext = useSetAtom(chatWidgetPendingOrderContextState)
  const setPendingTurnContext = useSetAtom(chatWidgetPendingTurnContextState)
  const pageContext = usePageContext()
  const pageTurnContextRef = useRef<TurnContext>({})
  const orderTurnContextRef = useRef<string | null>(null)
  const programmaticTurnContextRef = useRef<TurnContext | null>(null)
  const imageContextRef = useRef<ImageContext | null>(null)

  useLayoutEffect(() => {
    pageTurnContextRef.current = {
      ...(pageContext ? { pageContext } : {}),
      routeContext: `[Context: The user is currently on this page: ${pathname}.]`,
    }
  }, [pageContext, pathname])

  // This must be ready before the pending-message effect submits the first
  // post-purchase turn to Chat.
  useLayoutEffect(() => {
    orderTurnContextRef.current = pendingOrderContext
      ? buildOrderContextNote(pendingOrderContext)
      : null
  }, [pendingOrderContext])

  useLayoutEffect(() => {
    programmaticTurnContextRef.current = pendingTurnContext
  }, [pendingTurnContext])

  // Keep the context callbacks stable to avoid resetting the Chat conversation.
  // getShopperContext is a stable reader; dynamic values are held in refs.
  const setImageAnalysis = useCallback(
    (analysis: string, isImageOnly: boolean) => {
      imageContextRef.current = buildImageContext(analysis, isImageOnly)
    },
    [],
  )
  const clearImageAnalysis = useCallback(() => {
    imageContextRef.current = null
  }, [])

  const getTurnContext = useCallback((): TurnContext => {
    const shopperContext = getShopperContext()
    const orderContext = orderTurnContextRef.current
    const programmaticTurnContext = programmaticTurnContextRef.current
    const imageContext = imageContextRef.current

    if (orderContext) {
      orderTurnContextRef.current = null
      setPendingOrderContext(null)
    }
    if (programmaticTurnContext) {
      programmaticTurnContextRef.current = null
      setPendingTurnContext(null)
    }
    if (imageContext) imageContextRef.current = null

    return {
      ...(shopperContext ? { shopperContext } : {}),
      ...(orderContext ? { orderContext } : {}),
      ...programmaticTurnContext,
      ...imageContext,
      ...pageTurnContextRef.current,
    }
  }, [getShopperContext, setPendingOrderContext, setPendingTurnContext])

  return { getTurnContext, setImageAnalysis, clearImageAnalysis }
}
