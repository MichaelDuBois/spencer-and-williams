'use client'

import { HelpCircle, MessageSquare, Wrench } from 'lucide-react'

import { ecommerceConfig } from '@/app/ecommerce/config'
import { OrderConfirmationPageContent } from '@/components/order/OrderConfirmationPageContent'
import type { AILink } from '@/components/order/PostPurchaseAI'

const AI_LINKS: AILink[] = [
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'How to care for your products',
    description: 'Get personalized maintenance tips',
    question: 'How should I care for and maintain the products I just ordered?',
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: 'Common questions answered',
    description: 'Find answers instantly with AI',
    question:
      'What are the most common questions about the products I ordered?',
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
    slug={ecommerceConfig.slug}
    aiLinks={AI_LINKS}
  />
)

export default OrderConfirmationPage
