'use client'

import { useAtomValue } from 'jotai'

import { useAssistantCatalog } from '@/features/aiAssistant/AssistantCatalogContext'
import { AIAssistantPanel } from '@/features/aiAssistant/components/AIAssistantPanel'
import { useIsAIAssistantRoute } from '@/features/aiAssistant/hooks/ui/useIsAIAssistantRoute'
import { useIsAssistantSidePanelOpen } from '@/features/aiAssistant/hooks/ui/useIsAssistantSidePanelOpen'
import {
  isAIAssistantOpenState,
  isAIAssistantExpandedState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { useChatWidgetMode } from '@/features/chatWidget/hooks/useChatWidgetMode'
import { useIsChatWidgetActive } from '@/features/chatWidget/hooks/useIsChatWidgetActive'
import { cn } from '@/lib/utils'

interface AIAssistantLayoutProps {
  children: React.ReactNode
  basePath: string
}

export const AIAssistantLayout = ({
  children,
  basePath,
}: AIAssistantLayoutProps) => {
  const catalog = useAssistantCatalog()
  const isOpen = useAtomValue(isAIAssistantOpenState)
  const isExpanded = useAtomValue(isAIAssistantExpandedState)
  const { isValidRoute } = useIsAIAssistantRoute(basePath)
  const mode = useChatWidgetMode(basePath)
  const isChatWidgetActive = useIsChatWidgetActive()
  const isSidePanelOpen = useIsAssistantSidePanelOpen(basePath)

  // Show panel on valid routes, or on homepage/map when fullscreen
  const canShowPanel =
    !isChatWidgetActive &&
    catalog?.isReady !== false &&
    (isValidRoute || (mode === 'fullscreen' && isExpanded))
  const showPanel = isOpen && canShowPanel
  const shouldReservePanel = isChatWidgetActive
    ? isSidePanelOpen
    : canShowPanel && isSidePanelOpen

  return (
    <div
      className={cn(
        'min-h-[calc(100dvh-var(--header-height,73px))] transition-[padding] duration-300 ease-out',
        shouldReservePanel && 'lg:pr-[var(--assistant-panel-width,400px)]',
      )}>
      <div
        className={cn(
          showPanel &&
            !isExpanded &&
            'transition-opacity duration-300 ease-out',
          showPanel &&
            !isExpanded &&
            'pointer-events-none opacity-0 lg:pointer-events-auto lg:opacity-100',
          showPanel && isExpanded && 'pointer-events-none opacity-0',
        )}>
        {children}
      </div>

      {/* AI Assistant Panel - fixed position */}
      {canShowPanel && (
        <AIAssistantPanel key={catalog?.sessionKey} basePath={basePath} />
      )}
    </div>
  )
}
