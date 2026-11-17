'use client'

import { useIsChatWidgetActive } from '@/features/chatWidget/hooks/useIsChatWidgetActive'
import { useActiveConfig } from '@/hooks/useActiveConfig'

export interface ComparisonCapability {
  configurationId: string
  minItems: 2
  maxItems: 3
}

export const useComparisonCapability = (): ComparisonCapability | null => {
  const isChatWidgetActive = useIsChatWidgetActive()
  const configurationId =
    useActiveConfig()?.features.agentStudio.chatWidgetComparisonConfigurationID?.trim()

  if (!isChatWidgetActive || !configurationId) return null

  return { configurationId, minItems: 2, maxItems: 3 }
}
