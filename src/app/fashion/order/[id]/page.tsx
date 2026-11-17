'use client'

import { useAtomValue } from 'jotai'
import { HelpCircle, Shirt, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { fashionConfig } from '@/app/fashion/config'
import { DeliveryTracker } from '@/components/order/DeliveryTracker'
import { OrderConfirmationHeader } from '@/components/order/OrderConfirmationHeader'
import { OrderContinueShopping } from '@/components/order/OrderContinueShopping'
import { OrderItemsSummary } from '@/components/order/OrderItemsSummary'
import { OrderNotFound } from '@/components/order/OrderNotFound'
import { type AILink, PostPurchaseAI } from '@/components/order/PostPurchaseAI'
import { getOrderAtom } from '@/stores/order'

const FashionOrderConfirmationPage = () => {
  const { slug } = fashionConfig
  const order = useAtomValue(getOrderAtom(slug))
  const continueShoppingHref = `/${slug}/search`
  const showOrderHistoryLink =
    fashionConfig.features?.orderHistory?.enabled ?? false

  if (!order) {
    return (
      <OrderNotFound
        variant="editorial"
        continueShoppingHref={continueShoppingHref}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <OrderConfirmationHeader variant="editorial" orderId={order.id} />
        <DeliveryTracker variant="editorial" createdAt={order.createdAt} />
        <OrderItemsSummary variant="editorial" order={order} />
        <div className="mt-8">
          <PostPurchaseAI
            order={order}
            basePath={`/${slug}`}
            links={AI_LINKS}
          />
        </div>
        <OrderContinueShopping
          variant="editorial"
          continueShoppingHref={continueShoppingHref}
        />
        {showOrderHistoryLink && (
          <div className="mt-8 text-center">
            <Link
              href={`/${slug}/orders`}
              className="text-xs tracking-widest uppercase underline underline-offset-4 transition-opacity hover:opacity-70">
              View Order History
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default FashionOrderConfirmationPage

const AI_LINKS: AILink[] = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Style your items',
    description: 'Get outfit ideas for your purchase',
    question: 'How can I style the items I just ordered?',
  },
  {
    icon: <Shirt className="h-5 w-5" />,
    title: 'Care for your items',
    description: 'Find care tips for your purchase',
    question: 'How should I care for the items I just ordered?',
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: 'Ask about your order',
    description: 'Get help with your recent order',
    question: 'I have a question about my recent order. Can you help me?',
  },
]
