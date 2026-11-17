'use client'

import { motion } from 'motion/react'

import { ThinkingDot } from '@/features/aiAssistant/components/ThinkingDot'
import { EASE_SMOOTH } from '@/lib/animations'

import type { ReactNode } from 'react'

interface StreamingResultsLayoutProps {
  intro: string
  answer?: string
  groupSlots: ReactNode[]
  streamingGroupSlot: ReactNode | null
}

export const StreamingResultsLayout = ({
  intro,
  answer,
  groupSlots,
  streamingGroupSlot,
}: StreamingResultsLayoutProps) => (
  <div className="space-y-3">
    {answer && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: EASE_SMOOTH }}
        className="bg-muted text-foreground rounded-card px-4 py-2">
        <p className="text-sm whitespace-pre-wrap">{answer}</p>
      </motion.div>
    )}

    {intro && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: EASE_SMOOTH }}
        className="bg-muted text-foreground rounded-card px-4 py-2">
        <p className="text-sm font-medium">{intro}</p>
      </motion.div>
    )}

    {groupSlots.map((slot, index) => (
      <div
        key={index}
        className="bg-muted text-foreground rounded-card w-fit max-w-full px-4 py-3">
        {slot}
      </div>
    ))}

    {streamingGroupSlot && (
      <div className="bg-muted text-foreground rounded-card w-fit max-w-full px-4 py-3">
        {streamingGroupSlot}
      </div>
    )}

    {!streamingGroupSlot && (
      <div className="px-4 py-2">
        <ThinkingDot />
      </div>
    )}
  </div>
)
