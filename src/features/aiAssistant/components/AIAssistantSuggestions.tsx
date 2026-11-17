'use client'

import { motion } from 'motion/react'

import { EASE_SMOOTH } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface AIAssistantSuggestionsProps {
  questions: string[]
  onSelect: (question: string) => void
  stacked?: boolean
  className?: string
}

export const AIAssistantSuggestions = ({
  questions,
  onSelect,
  stacked = false,
  className,
}: AIAssistantSuggestionsProps) => {
  if (questions.length === 0) return null

  return (
    <motion.div
      className={cn(
        'grid grid-cols-1 gap-3',
        !stacked && 'sm:grid-cols-2',
        className,
      )}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}>
      {questions.map((question, index) => (
        <motion.button
          key={index}
          type="button"
          onClick={() => onSelect(question)}
          variants={{
            hidden: { opacity: 0, scale: 0.97, y: 6 },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.2, ease: EASE_SMOOTH },
            },
          }}
          whileTap={{ scale: 0.99 }}
          className="border-border text-foreground hover:border-accent hover:bg-accent/5 rounded-button w-full cursor-pointer border px-4 py-2 text-left text-sm transition-colors">
          {question}
        </motion.button>
      ))}
    </motion.div>
  )
}
