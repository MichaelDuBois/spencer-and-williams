'use client'

import Link from 'next/link'

import { OrderCard } from '@/features/aiAssistant/components/messages/OrderCard'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import type { OrderHistoryDisplayData } from '@/features/aiAssistant/types'
import { useActiveConfig } from '@/hooks/useActiveConfig'

interface PreviousOrdersMessageProps {
  data: OrderHistoryDisplayData
  isExpanded?: boolean
  /** Overrides the legacy assistant's panel-collapse behavior on link click. */
  onLinkClick?: () => void
}

/**
 * Renders displayOrders tool output: an optional intro bubble followed by one
 * card per order, sourced from the session's local order history.
 */
export const PreviousOrdersMessage = ({
  data,
  isExpanded = false,
  onLinkClick,
}: PreviousOrdersMessageProps) => {
  const config = useActiveConfig()
  const legacyLinkClick = useAssistantLinkClick()
  const handleLinkClick = onLinkClick ?? legacyLinkClick
  const ordersHref = config?.slug ? `/${config.slug}/orders` : undefined

  return (
    <div className="space-y-3">
      {data.intro && (
        <p className="text-foreground text-sm font-medium">{data.intro}</p>
      )}

      {data.orders.map((order) =>
        ordersHref ? (
          <Link
            onClick={handleLinkClick}
            key={order.id}
            href={ordersHref}
            aria-label={`View order ${order.id} in your order history`}
            className="rounded-card block">
            <OrderCard order={order} isExpanded={isExpanded} />
          </Link>
        ) : (
          <OrderCard key={order.id} order={order} isExpanded={isExpanded} />
        ),
      )}
    </div>
  )
}
