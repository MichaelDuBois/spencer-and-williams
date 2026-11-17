'use client'

import { useAtomValue } from 'jotai'

import {
  useIsAIAssistantRoute,
  useOpenAssistantPanel,
} from '@/features/aiAssistant'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import {
  demoOptionsStore,
  intentRoutingEnabledAtom,
} from '@/stores/demoOptions'
import { getUserIntent } from '@/utilities/getUserIntent'

export const useIntentRouting = (basePath: string) => {
  const config = useActiveConfig()
  const isToggledOn = useAtomValue(intentRoutingEnabledAtom, {
    store: demoOptionsStore,
  })
  const { isHomepage, isValidRoute } = useIsAIAssistantRoute(basePath)
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  const isAvailable = config?.features.intentRouting?.enabled ?? false
  // Routing where AIAssistantLayout won't mount the panel would clear the
  // query and open nothing, leaving Enter looking broken.
  const canHostAssistant = isValidRoute || isHomepage

  const routeIfConversational = (query: string): boolean => {
    const trimmed = query.trim()
    if (!isAvailable || !isToggledOn || !canHostAssistant || !trimmed)
      return false
    if (!getUserIntent(trimmed)) return false

    openWithMessage(trimmed, {
      expanded: isHomepage,
      navigate: false,
      clearHistory: false,
    })
    return true
  }

  return { routeIfConversational }
}
