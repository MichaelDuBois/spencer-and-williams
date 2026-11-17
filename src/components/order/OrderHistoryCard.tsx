'use client'

import { ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { OrderItemsSummary } from '@/components/order/OrderItemsSummary'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { Button } from '@/components/ui/button/Button'
import { useOpenAssistantPanel } from '@/features/aiAssistant/hooks/ui/useOpenAssistantPanel'
import { toOrderContext } from '@/features/aiAssistant/utils/buildOrderContext'
import { cn } from '@/lib/utils'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

interface OrderHistoryCardProps {
  order: OrderHistoryEntry
  basePath: string
}

const formatOrderDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export const OrderHistoryCard = ({
  order,
  basePath,
}: OrderHistoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  const handleAskAI = () => {
    openWithMessage(`I have a question about my order ${order.id}.`, {
      clearHistory: true,
      expanded: true,
      navigate: false,
      orderContext: toOrderContext(order),
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="border-border bg-card rounded-card hover:border-accent/50 flex w-full cursor-pointer items-center gap-4 border p-4 text-left transition-colors sm:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{order.id}</span>
            <OrderStatusBadge
              createdAt={order.createdAt}
              statusOverride={order.statusOverride}
            />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {formatOrderDate(order.createdAt)} · {itemCount}{' '}
            {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <span className="shrink-0 font-semibold">
          ${order.total.toFixed(2)}
        </span>

        <ChevronDown
          className={cn(
            'text-muted-foreground h-5 w-5 shrink-0 transition-transform',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-4">
          <OrderItemsSummary variant="standard" order={order} />
          <Button
            type="button"
            onClick={handleAskAI}
            className="rounded-button w-full sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Ask AI about this order
          </Button>
        </div>
      )}
    </div>
  )
}
