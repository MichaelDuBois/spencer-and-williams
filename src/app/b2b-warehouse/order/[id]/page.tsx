'use client'

import { HelpCircle, MessageSquare, Wrench } from 'lucide-react'

import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { OrderConfirmationPageContent } from '@/components/order/OrderConfirmationPageContent'
import type { AILink } from '@/components/order/PostPurchaseAI'

const AI_LINKS: AILink[] = [
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'Maintenance & care for your tools',
    description: 'Keep your equipment jobsite-ready',
    question:
      'How should I maintain and care for the tools and supplies I just ordered?',
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: 'Specs & compatibility answered',
    description: 'Get product details instantly with AI',
    question:
      'What are the key specs and compatibility notes for the items I just ordered?',
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: 'Contact customer support',
    description: 'Chat with our support team',
    question: 'I have a question about my recent order. Can you help me?',
  },
]

const OrderConfirmationPage = () => (
  <OrderConfirmationPageContent
    slug={b2bWarehouseConfig.slug}
    aiLinks={AI_LINKS}
  />
)

export default OrderConfirmationPage
