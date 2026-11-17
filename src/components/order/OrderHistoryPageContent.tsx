'use client'

import { PackageOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { OrderHistoryList } from '@/components/order/OrderHistoryList'
import { Button } from '@/components/ui/button/Button'
import { useOpenAssistantPanel } from '@/features/aiAssistant/hooks/ui/useOpenAssistantPanel'
import { toOrderContext } from '@/features/aiAssistant/utils/buildOrderContext'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useOrderHistory } from '@/hooks/useOrderHistory'

export const OrderHistoryPageContent = () => {
  const config = useActiveConfig()
  const basePath = `/${config?.slug ?? 'default'}`
  const { orders } = useOrderHistory()
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  const hasOrders = orders.length > 0

  const handleAskAboutOrders = () => {
    const latestOrder = orders[0]
    const orderContext = latestOrder ? toOrderContext(latestOrder) : undefined

    openWithMessage('I have some questions about my past orders.', {
      clearHistory: true,
      expanded: true,
      navigate: false,
      orderContext,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Order History</h1>
        {hasOrders && (
          <Button
            type="button"
            onClick={handleAskAboutOrders}
            className="rounded-button">
            <Sparkles className="h-4 w-4" />
            Ask about your orders
          </Button>
        )}
      </div>

      {hasOrders ? (
        <OrderHistoryList orders={orders} basePath={basePath} />
      ) : (
        <div className="border-border bg-card rounded-card flex flex-col items-center gap-4 border p-12 text-center">
          <PackageOpen className="text-muted-foreground h-10 w-10" />
          <div>
            <p className="text-lg font-semibold">No orders yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              When you place an order, it will show up here.
            </p>
          </div>
          <Link
            href={`${basePath}/search`}
            className="text-primary text-sm hover:underline">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  )
}
