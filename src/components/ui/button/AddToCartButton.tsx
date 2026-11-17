'use client'

import { Check, ShoppingCart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button/Button'
import {
  CLIP_PATH_HIDDEN_BOTTOM,
  CLIP_PATH_VISIBLE,
  EASE_SMOOTH,
  transitionNormal,
} from '@/lib/animations'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  onAdd: () => void | Promise<void>
  className?: string
  compact?: boolean
  animated?: boolean
  showIcon?: boolean
  addedLabel?: string
  label?: string
}

const ADDED_DURATION = 1500

export const AddToCartButton = ({
  onAdd,
  className,
  compact,
  animated = true,
  showIcon = true,
  addedLabel = 'Added!',
  label = 'Add to Cart',
}: AddToCartButtonProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAdded || isAdding) return
    setError(null)
    const finish = () => {
      setIsAdding(false)
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), ADDED_DURATION)
    }
    const fail = (reason: unknown) => {
      setIsAdding(false)
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to add this product. Please try again.',
      )
    }
    try {
      const result = onAdd()
      if (result) {
        setIsAdding(true)
        void result.then(finish, fail)
      } else finish()
    } catch (reason) {
      fail(reason)
    }
  }
  const feedback = error ? (
    <span role="alert" className="text-destructive text-xs">
      {error}
    </span>
  ) : null

  if (compact) {
    return (
      <>
        <Button
          onClick={handleClick}
          disabled={isAdded || isAdding}
          aria-busy={isAdding}
          aria-label={
            isAdding ? 'Checking availability' : isAdded ? addedLabel : label
          }
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full',
            isAdded && 'bg-success text-success-foreground',
            className,
          )}>
          {isAdded ? (
            <Check className="h-4 w-4" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </Button>
        {feedback}
      </>
    )
  }

  if (!animated) {
    return (
      <>
        <Button
          onClick={handleClick}
          disabled={isAdded || isAdding}
          aria-busy={isAdding}
          className={cn('w-full gap-2 disabled:opacity-100', className)}>
          {isAdded ? (
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              {addedLabel}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {showIcon && <ShoppingCart className="h-4 w-4" />}
              {isAdding ? 'Checking…' : label}
            </span>
          )}
        </Button>
        {feedback}
      </>
    )
  }

  return (
    <>
      <motion.div
        animate={isAdded ? { scale: [1, 1.03, 1] } : {}}
        transition={transitionNormal}
        className={cn('relative', className)}>
        {/* Base background */}
        <div className="bg-accent rounded-button absolute inset-0" />
        {/* Success background overlay with clip-path reveal */}
        <motion.div
          initial={false}
          animate={{
            clipPath: isAdded ? CLIP_PATH_VISIBLE : CLIP_PATH_HIDDEN_BOTTOM,
          }}
          transition={{ duration: 0.25, ease: EASE_SMOOTH }}
          className="bg-success rounded-button absolute inset-0"
        />
        <Button
          onClick={handleClick}
          disabled={isAdded || isAdding}
          aria-busy={isAdding}
          className={cn(
            'rounded-button relative w-full gap-2 bg-transparent py-6 hover:bg-transparent',
            isAdded && 'text-success-foreground',
          )}>
          <AnimatePresence mode="wait" initial={false}>
            {isAdded ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.1 }}
                className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                {addedLabel}
              </motion.span>
            ) : (
              <motion.span
                key="cart"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.1 }}
                className="flex items-center gap-2">
                {showIcon && <ShoppingCart className="h-5 w-5" />}
                {isAdding ? 'Checking…' : label}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
      {feedback}
    </>
  )
}
