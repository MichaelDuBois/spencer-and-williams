'use client'

import { useAtomValue } from 'jotai'
import { ReceiptText } from 'lucide-react'
import Link from 'next/link'

import { DeliveryTracker } from '@/components/order/DeliveryTracker'
import { OrderConfirmationHeader } from '@/components/order/OrderConfirmationHeader'
import { OrderItemsSummary } from '@/components/order/OrderItemsSummary'
import { OrderNotFound } from '@/components/order/OrderNotFound'
import { type AILink, PostPurchaseAI } from '@/components/order/PostPurchaseAI'
import { Button } from '@/components/ui/button/Button'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { getOrderAtom } from '@/stores/order'

interface OrderConfirmationPageContentProps {
  slug: string
  aiLinks: AILink[]
}

export const OrderConfirmationPageContent = ({
  slug,
  aiLinks,
}: OrderConfirmationPageContentProps) => {
  const order = useAtomValue(getOrderAtom(slug))
  const config = useActiveConfig()
  const showOrderHistoryLink = config?.features?.orderHistory?.enabled ?? false
  const basePath = `/${slug}`

  if (!order) {
    return (
      <OrderNotFound
        variant="standard"
        continueShoppingHref={`${basePath}/search`}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderConfirmationHeader variant="standard" orderId={order.id} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <DeliveryTracker variant="standard" createdAt={order.createdAt} />
          <OrderItemsSummary variant="standard" order={order} />
        </div>

        <div className="space-y-4">
          <PostPurchaseAI order={order} basePath={basePath} links={aiLinks} />
          {showOrderHistoryLink && (
            <Button asChild className="rounded-button w-full py-3">
              <Link href={`${basePath}/orders`}>
                <ReceiptText className="h-4 w-4" />
                View order history
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
