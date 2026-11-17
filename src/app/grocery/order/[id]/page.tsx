'use client'

import { ChefHat, HelpCircle, UtensilsCrossed } from 'lucide-react'

import { groceryConfig } from '@/app/grocery/config'
import { OrderConfirmationPageContent } from '@/components/order/OrderConfirmationPageContent'
import type { AILink } from '@/components/order/PostPurchaseAI'

const AI_LINKS: AILink[] = [
  {
    icon: <UtensilsCrossed className="h-5 w-5" />,
    title: 'Recipe ideas with your groceries',
    description: 'Get meal suggestions based on your order',
    question: 'What recipes can I make with the groceries I just ordered?',
  },
  {
    icon: <ChefHat className="h-5 w-5" />,
    title: 'Storage & freshness tips',
    description: 'Keep your groceries fresh longer',
    question:
      'How should I store the groceries I just ordered to keep them fresh?',
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: 'Questions about your order',
    description: 'Get help with delivery or substitutions',
    question: 'I have a question about my grocery order. Can you help me?',
  },
]

const OrderConfirmationPage = () => (
  <OrderConfirmationPageContent slug={groceryConfig.slug} aiLinks={AI_LINKS} />
)

export default OrderConfirmationPage
