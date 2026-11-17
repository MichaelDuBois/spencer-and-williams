'use client'

import { AssistantCardNavigationProvider } from '@/features/aiAssistant/components/messages/AssistantCardNavigationContext'
import { getChatCardRenderer } from '@/features/chatWidget/components/chatCardRenderers'
import { useCollapseChatWidgetPanel } from '@/features/chatWidget/components/chatWidgetPanelContext'
import {
  getFashionResultType,
  getGroceryResultType,
} from '@/features/chatWidget/utils/resolveChatResultType'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { trackProductClick } from '@/lib/analytics/product-click-events'
import { track } from '@/lib/analytics/track'

interface VerticalChatResultItemProps {
  item: Record<string, unknown>
  onClick?: () => void
  onAuxClick?: () => void
  compact?: boolean
}

export const ChatResultItem = ({
  item,
  onClick,
  onAuxClick,
  compact = false,
}: VerticalChatResultItemProps) => {
  const config = useActiveConfig()
  const collapsePanel = useCollapseChatWidgetPanel()
  const objectID = typeof item.objectID === 'string' ? item.objectID : ''
  const result = item.__groupedToolResult ?? item.__displayToolResult
  const why =
    result &&
    typeof result === 'object' &&
    'why' in result &&
    typeof result.why === 'string'
      ? result.why
      : ''
  const displayItem = { objectID, why }
  const isProduct =
    config?.slug === 'fashion'
      ? getFashionResultType(item) === 'products'
      : config?.slug === 'grocery'
        ? getGroceryResultType(item) === 'products'
        : ['ecommerce', 'electronics', 'furnishing', 'b2b-warehouse'].includes(
            config?.slug ?? '',
          )
  // Grouped results rank within their group (instantsearch.js resets the
  // counter per group), so their __position is incomparable with search-result
  // positions and is omitted; __displayToolResult items keep it — that is the
  // true search rank from withQueryAttribution.
  const isGrouped = item.__groupedToolResult !== undefined
  const queryID =
    typeof item.__queryID === 'string' && item.__queryID
      ? item.__queryID
      : undefined
  const position =
    !isGrouped && typeof item.__position === 'number'
      ? item.__position
      : undefined
  const handleLinkClick = () => {
    track('assistant_result_clicked', {
      surface: 'chat_widget',
      objectID,
    })
    if (config && isProduct) {
      trackProductClick(
        { objectID, __queryID: queryID, __position: position },
        { surface: 'chat_widget', index: config.algolia.primaryIndex.name },
      )
    }
    collapsePanel?.()
    onClick?.()
  }

  if (!objectID || !config) return <></>

  const card = getChatCardRenderer(config.slug)?.(item, displayItem, compact)
  if (!card) return <></>

  return (
    <AssistantCardNavigationProvider onLinkClick={handleLinkClick}>
      <div onAuxClick={onAuxClick}>{card}</div>
    </AssistantCardNavigationProvider>
  )
}
