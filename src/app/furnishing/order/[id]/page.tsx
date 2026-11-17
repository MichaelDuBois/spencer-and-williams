'use client'

import { HelpCircle, Ruler, Wrench } from 'lucide-react'

import { furnishingConfig } from '@/app/furnishing/config'
import { OrderConfirmationPageContent } from '@/components/order/OrderConfirmationPageContent'
import type { AILink } from '@/components/order/PostPurchaseAI'

const AI_LINKS: AILink[] = [
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'Assembly & setup',
    description: 'Step-by-step guidance for your new pieces',
    question: 'How do I assemble and set up the furniture I just ordered?',
  },
  {
    icon: <Ruler className="h-5 w-5" />,
    title: 'Care & maintenance',
    description: 'Keep your furniture looking its best',
    question: 'How should I care for and maintain the products I just ordered?',
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: 'Delivery & support',
    description: 'Get help with your order',
    question: 'I have a question about my furnishing order. Can you help me?',
  },
]

const FurnishingOrderConfirmationPage = () => (
  <OrderConfirmationPageContent
    slug={furnishingConfig.slug}
    aiLinks={AI_LINKS}
  />
)

export default FurnishingOrderConfirmationPage
