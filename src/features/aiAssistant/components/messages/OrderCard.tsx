import { Package } from 'lucide-react'

import { Image } from '@/components/image/Image'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import type { OrderHistoryDisplayItem } from '@/features/aiAssistant/types'
import { formatDate } from '@/utilities/formatDate'
import type { OrderStatusOverride } from '@/utilities/orderStatus'

interface OrderCardProps {
  order: OrderHistoryDisplayItem
  isExpanded: boolean
}

const MAX_VISIBLE_ITEMS = 4

const asStatusOverride = (status?: string): OrderStatusOverride | undefined =>
  status === 'cancelled' || status === 'returned' ? status : undefined

export const OrderCard = ({ order, isExpanded }: OrderCardProps) => {
  const visibleItems = order.items.slice(0, MAX_VISIBLE_ITEMS)
  const overflow = order.items.length - MAX_VISIBLE_ITEMS

  return (
    <div className="bg-muted text-foreground rounded-card border-border hover:border-accent/50 w-fit max-w-full border px-4 py-3 transition-colors">
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Package className="h-3.5 w-3.5" />
          {order.id}
        </span>
        <OrderStatusBadge
          createdAt={order.createdAt}
          statusOverride={asStatusOverride(order.status)}
        />
      </div>

      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
        <span>{formatDate(order.createdAt)}</span>
        <span>·</span>
        <span className="text-foreground font-medium">
          ${order.total.toFixed(2)}
        </span>
      </div>

      <div className="scrollbar-slim flex gap-2 overflow-x-auto">
        {visibleItems.map((item) => (
          <div
            key={item.objectID}
            className="bg-background border-border flex w-16 shrink-0 flex-col items-center rounded-md border p-1.5">
            <div className="bg-muted relative mb-1 h-10 w-10 overflow-hidden rounded">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <p className="text-micro w-full truncate text-center leading-tight">
              {isExpanded
                ? item.name
                : item.name.split(' ').slice(0, 2).join(' ')}
            </p>
          </div>
        ))}
        {overflow > 0 && (
          <div className="bg-background border-border flex w-16 shrink-0 flex-col items-center justify-center rounded-md border p-1.5">
            <span className="text-muted-foreground text-xs">+{overflow}</span>
          </div>
        )}
      </div>
    </div>
  )
}
