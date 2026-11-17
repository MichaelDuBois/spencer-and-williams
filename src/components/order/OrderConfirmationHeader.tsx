'use client'

import { Check } from 'lucide-react'
import { motion } from 'motion/react'

import { EASE_SMOOTH, transitionSlow } from '@/lib/animations'

type Variant = 'standard' | 'editorial'

interface OrderConfirmationHeaderProps {
  variant: Variant
  orderId: string
}

const SuccessCheckmark = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.4, ease: EASE_SMOOTH }}
    className="bg-success mx-auto flex h-20 w-20 items-center justify-center rounded-full">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ ...transitionSlow, delay: 0.2 }}>
      <Check className="text-success-foreground h-10 w-10" strokeWidth={3} />
    </motion.div>
  </motion.div>
)

export const OrderConfirmationHeader = ({
  variant,
  orderId,
}: OrderConfirmationHeaderProps) => {
  if (variant === 'editorial') {
    return (
      <div className="border-border/30 border-b pb-12 text-center">
        <p className="text-muted-foreground text-micro mb-6 tracking-[0.3em] uppercase">
          Thank you
        </p>
        <h1 className="font-secondary mb-6 text-3xl tracking-[0.15em] uppercase sm:text-4xl">
          Your Order Is Confirmed
        </h1>
        <p className="text-muted-foreground text-sm">
          Order&nbsp;
          <span className="text-foreground tracking-widest">{orderId}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="mb-10 text-center">
      <SuccessCheckmark />
      <h1 className="mt-4 text-3xl font-bold">Order Confirmed</h1>
      <p className="text-muted-foreground mt-2">
        Thank you for your order! Your order number is{' '}
        <span className="text-foreground font-medium">{orderId}</span>
      </p>
    </div>
  )
}
