'use client'

import { ThinkingDot } from '@/features/aiAssistant/components/ThinkingDot'
import { useTypingEffect } from '@/features/aiAssistant/hooks/ui/useTypingEffect'

const THINKING_MESSAGES = [
  'Thinking...',
  'Searching our catalog...',
  'Preparing your results...',
]

export const ThinkingIndicator = () => {
  const displayedText = useTypingEffect(THINKING_MESSAGES, {
    typingSpeed: 30,
    deletingSpeed: 20,
    pauseDuration: 3000,
  })

  return (
    <div className="flex items-center space-x-2">
      <ThinkingDot />
      <span
        className="animate-shimmer from-muted-foreground via-muted-foreground/60 to-muted-foreground text-muted-foreground bg-linear-to-r text-xs font-medium"
        style={{
          backgroundSize: '400% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
        {displayedText}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  )
}
