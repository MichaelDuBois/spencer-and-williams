'use client'

import { useAtomValue } from 'jotai'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { chatWidgetEnabledAtom, demoOptionsStore } from '@/stores/demoOptions'

/**
 * Whether the InstantSearch Chat widget replaces the AI assistant panel: the
 * demo toggle is on and the active config declares a chat widget agent.
 *
 * The toggle survives an environment switch, but the agent is per environment
 * (ecommerce staging has none), so the toggle alone isn't enough.
 */
export const useIsChatWidgetActive = (): boolean => {
  const chatWidgetEnabled = useAtomValue(chatWidgetEnabledAtom, {
    store: demoOptionsStore,
  })
  const config = useActiveConfig()

  return (
    chatWidgetEnabled && Boolean(config?.features.agentStudio.chatWidgetAgentID)
  )
}
