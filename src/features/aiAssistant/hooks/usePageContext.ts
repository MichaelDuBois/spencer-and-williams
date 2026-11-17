'use client'

import { useAtomValue } from 'jotai'

import { useProductContext } from '@/features/aiAssistant/hooks/useProductContext'
import {
  b2bContentContextState,
  fashionContentContextState,
  travelContentContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { buildPageContext } from '@/features/aiAssistant/utils/buildPageContext'

/**
 * The page record note for the record the user is currently viewing, shared by
 * both assistant implementations.
 */
export const usePageContext = (): string | null => {
  const productContext = useProductContext()
  const travelContentContext = useAtomValue(travelContentContextState)
  const b2bContentContext = useAtomValue(b2bContentContextState)
  const fashionContentContext = useAtomValue(fashionContentContextState)

  return buildPageContext({
    productContext,
    travelContentContext,
    b2bContentContext,
    fashionContentContext,
  })
}
