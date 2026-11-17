'use client'

import { HelpCircle, ShieldCheck, Wrench } from 'lucide-react'

import { electronicsConfig } from '@/app/electronics/config'
import { OrderConfirmationPageContent } from '@/components/order/OrderConfirmationPageContent'
import type { AILink } from '@/components/order/PostPurchaseAI'

const AI_LINKS: AILink[] = [
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'Set up your new devices',
    description: 'Step-by-step guidance to get started',
    question:
      'How do I set up and get started with the devices I just ordered?',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Warranty & protection',
    description: 'Understand your coverage options',
    question:
      'What warranty and protection options apply to the products I ordered?',
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: 'Troubleshooting & support',
    description: 'Get help with your order',
    question: 'I have a question about my electronics order. Can you help me?',
  },
]

const OrderConfirmationPage = () => (
  <OrderConfirmationPageContent
    slug={electronicsConfig.slug}
    aiLinks={AI_LINKS}
  />
)

export default OrderConfirmationPage
