import { OrderHistoryCard } from '@/components/order/OrderHistoryCard'
import type { OrderHistoryEntry } from '@/stores/orderHistory'

interface OrderHistoryListProps {
  orders: OrderHistoryEntry[]
  basePath: string
}

export const OrderHistoryList = ({
  orders,
  basePath,
}: OrderHistoryListProps) => (
  <div className="space-y-4">
    {orders.map((order) => (
      <OrderHistoryCard key={order.id} order={order} basePath={basePath} />
    ))}
  </div>
)
