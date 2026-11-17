'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { Search } from 'lucide-react'

import {
  followUpQueryState,
  isAssistantBusyState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { cn } from '@/lib/utils'

interface SeeMoreLikeThisButtonProps {
  /** The specific group's title (e.g. "Asics Running Shoes") — the primary
   * anchor for the follow-up so it stays relevant to the exact carousel. */
  title?: string
  /** The broader originating query (e.g. "running shoes") — fallback anchor. */
  query?: string
  className?: string
}

const buildFollowUpMessage = (
  title?: string,
  query?: string,
): string | null => {
  const subject = title?.trim() || query?.trim()
  if (!subject) return null
  return `Show me more like ${subject}`
}

export const SeeMoreLikeThisButton = ({
  title,
  query,
  className,
}: SeeMoreLikeThisButtonProps) => {
  const setFollowUpQuery = useSetAtom(followUpQueryState)
  const isBusy = useAtomValue(isAssistantBusyState)

  const message = buildFollowUpMessage(title, query)
  if (!message) return null

  // Setting the atom dispatches the follow-up; AIAssistantChat owns the send
  // and scrolls the new user message into view once it's appended.
  const handleClick = () => {
    if (isBusy) return
    // excludeShown: this is a "more like this" ask — drop already-shown items
    // from the results pool so the shopper gets fresh, non-repeating matches.
    setFollowUpQuery({ text: message, excludeShown: true })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      className={cn(
        'border-border text-muted-foreground hover:bg-foreground/5 rounded-button flex w-full cursor-pointer items-center justify-center gap-2 border px-4 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}>
      <Search className="h-3 w-3" />
      See more like this
    </button>
  )
}
