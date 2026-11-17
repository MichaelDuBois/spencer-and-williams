'use client'

import { useAtomValue } from 'jotai'

import {
  buildGreetingText,
  buildStarterQuestions,
} from '@/features/aiAssistant/utils/buildGreeting'
import { getVerticalConfig } from '@/features/aiAssistant/verticals/registry'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useOrderHistory } from '@/hooks/useOrderHistory'
import { usePersonalization } from '@/hooks/usePersonalization'
import {
  activePersonaAtom,
  personalizationStore,
} from '@/stores/personalization'

interface UseAssistantWelcomeReturn {
  /** Personalized empty-state line, or the vertical's fallback text. */
  greetingText: string
  /** Starter chips for the empty state, personalized where applicable. */
  starterQuestions: string[]
}

/**
 * Single source of the assistant's empty-state welcome: the greeting line and
 * starter questions derived from the active persona, order history, and the
 * current vertical's assistant config. No agent call — derived locally.
 */
export const useAssistantWelcome = (): UseAssistantWelcomeReturn => {
  const config = useActiveConfig()
  const verticalConfig = getVerticalConfig(config?.slug)
  const { mode } = usePersonalization()
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const { orders } = useOrderHistory()

  const greetingText = buildGreetingText({
    mode,
    persona,
    latestOrder: orders[0] ?? null,
    fallback: verticalConfig.emptyStateText,
    starters: verticalConfig.personaStarters,
  })
  const starterQuestions = buildStarterQuestions({
    mode,
    persona,
    hasOrders: orders.length > 0,
    fallback: verticalConfig.suggestedQuestions,
    starters: verticalConfig.personaStarters,
  })

  return { greetingText, starterQuestions }
}
