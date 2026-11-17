'use client'

import { motion } from 'motion/react'

import { EASE_SMOOTH } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface SuggestionButtonsProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
  disabled: boolean
  className?: string
  buttonClassName?: string
}

export const SuggestionButtons = ({
  suggestions,
  onSuggestionClick,
  disabled,
  className,
  buttonClassName,
}: SuggestionButtonsProps) => {
  if (suggestions.length === 0) return null

  return (
    <motion.div
      className={cn('flex flex-wrap gap-2', className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}>
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          disabled={disabled}
          variants={{
            hidden: { opacity: 0, scale: 0.9, y: 4 },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.2, ease: EASE_SMOOTH },
            },
          }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'border-border bg-background text-foreground hover:bg-muted hover:border-accent rounded-badge cursor-pointer border px-3 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            buttonClassName,
          )}>
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  )
}
