'use client'

import { Check, Package, Truck } from 'lucide-react'
import { motion } from 'motion/react'

import type { DeliveryTrackerProps } from '@/components/order/DeliveryTracker/deliveryTracker.types'
import { VARIANT_CLASSES } from '@/components/order/DeliveryTracker/deliveryTrackerVariants'
import { EASE_SMOOTH, transitionSlow } from '@/lib/animations'
import { cn } from '@/lib/utils'
import {
  DAY_MS,
  DELIVERY_TIMELINE_DAYS,
  getOrderStatus,
} from '@/utilities/orderStatus'

const formatDate = (d: Date, uppercase: boolean): string => {
  const formatted = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return uppercase ? formatted.toUpperCase() : formatted
}

export const DeliveryTracker = ({
  variant,
  createdAt,
}: DeliveryTrackerProps) => {
  const classes = VARIANT_CLASSES[variant]
  const isEditorial = variant === 'editorial'
  const uppercaseDate = isEditorial
  const strokeWidth = isEditorial ? 1.5 : undefined

  // Both the dates and the active step come from the order date via the same
  // helper OrderStatusBadge uses, so the tracker and the badge cannot disagree.
  const status = getOrderStatus({ createdAt })
  const currentStep = status === 'delivered' ? 3 : status === 'shipped' ? 2 : 1

  const stepDate = (dayOffset: number) =>
    formatDate(new Date(createdAt + dayOffset * DAY_MS), uppercaseDate)

  const steps = [
    {
      id: 1,
      label: 'Confirmed',
      date: stepDate(0),
      icon: (
        <Check className={classes.stepIconSize} strokeWidth={strokeWidth} />
      ),
    },
    {
      id: 2,
      label: 'In Transit',
      date: stepDate(DELIVERY_TIMELINE_DAYS.inTransit),
      icon: (
        <Truck className={classes.stepIconSize} strokeWidth={strokeWidth} />
      ),
    },
    {
      id: 3,
      label: 'Delivered',
      date: stepDate(DELIVERY_TIMELINE_DAYS.delivered),
      icon: (
        <Package className={classes.stepIconSize} strokeWidth={strokeWidth} />
      ),
    },
  ]

  const progressWidth = `${((currentStep - 1) / (steps.length - 1)) * 100}%`

  const showHeaderIcon = !isEditorial
  const showCurrentRing = !isEditorial
  const initialScale = isEditorial ? 0.85 : 0.8
  const linkText = isEditorial ? 'Track Your Order' : 'Track your order →'

  return (
    <section className={classes.wrapper}>
      {showHeaderIcon ? (
        <div className={classes.header}>
          <Truck className={classes.headerIcon} />
          <h2 className={classes.title}>Delivery Estimate</h2>
        </div>
      ) : (
        <h2 className={classes.title}>Delivery Estimate</h2>
      )}

      <div className="relative">
        <div
          className={cn(
            'absolute top-5',
            classes.progressTrackInset,
            classes.progressTrackThickness,
            classes.progressTrackBg,
          )}
        />

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: progressWidth }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE_SMOOTH }}
          className={cn(
            'absolute top-5',
            classes.progressFillInset,
            classes.progressTrackThickness,
            classes.progressFillBg,
          )}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.id <= currentStep
            const isCurrent = step.id === currentStep

            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: initialScale, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...transitionSlow, delay: 0.1 * index }}
                  className={cn(
                    classes.circle,
                    isCompleted
                      ? classes.circleCompleted
                      : classes.circleIncomplete,
                    showCurrentRing && isCurrent && 'ring-primary/20 ring-4',
                  )}>
                  {step.icon}
                </motion.div>
                <span
                  className={cn(
                    classes.label,
                    isCompleted
                      ? classes.labelCompleted
                      : classes.labelIncomplete,
                  )}>
                  {step.label}
                </span>
                <span className={classes.date}>{step.date}</span>
              </div>
            )
          })}
        </div>
      </div>

      <a href="#" className={classes.link}>
        {linkText}
      </a>
    </section>
  )
}
