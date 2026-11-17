import { cn } from '@/lib/utils'
import {
  getOrderStatus,
  type OrderStatus,
  type OrderStatusOverride,
} from '@/utilities/orderStatus'

interface OrderStatusBadgeProps {
  createdAt: number
  statusOverride?: OrderStatusOverride
  className?: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    processing: {
      label: 'Processing',
      className: 'bg-primary/10 text-primary',
    },
    shipped: { label: 'Shipped', className: 'bg-amber-500/15 text-amber-700' },
    delivered: {
      label: 'Delivered',
      className: 'bg-success/80 text-success-foreground',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-destructive/10 text-destructive',
    },
    returned: {
      label: 'Returned',
      className: 'bg-destructive/10 text-destructive',
    },
  }

export const OrderStatusBadge = ({
  createdAt,
  statusOverride,
  className,
}: OrderStatusBadgeProps) => {
  const status = getOrderStatus({ createdAt, statusOverride })
  const { label, className: statusClassName } = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusClassName,
        className,
      )}>
      {label}
    </span>
  )
}
