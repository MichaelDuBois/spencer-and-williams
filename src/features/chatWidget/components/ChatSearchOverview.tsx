'use client'

import { ResultCard } from 'react-instantsearch'

import { useIsChatWidgetActive } from '@/features/chatWidget/hooks/useIsChatWidgetActive'
import { useActiveConfig } from '@/hooks/useActiveConfig'

export const ChatSearchOverview = () => {
  const active = useIsChatWidgetActive()
  const agentId = useActiveConfig()?.features.agentStudio.chatWidgetAgentID
  if (!active || !agentId) return null
  return <ResultCard agentId={agentId} classNames={{ root: 'sw-ResultCard' }} />
}
