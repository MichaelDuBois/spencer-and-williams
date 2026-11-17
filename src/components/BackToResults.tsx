'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

interface BackToResultsProps {
  fallbackHref: string
  label?: string
  className?: string
}

export const BackToResults = ({
  fallbackHref,
  label = 'Back to results',
  className,
}: BackToResultsProps) => {
  const router = useRouter()

  const handleClick = () => {
    // Prefer browser history so the SRP is restored with its query, filters and
    // scroll. In the App Router, history.state.idx is the entry's position in the
    // in-app history (idx > 0 means there is a real back entry); fall back to
    // history.length only when idx is unavailable, then to the search route for
    // directly-opened/shared links.
    const idx = window.history.state?.idx
    const hasInAppHistory =
      typeof idx === 'number' ? idx > 0 : window.history.length > 1
    if (hasInAppHistory) {
      router.back()
      return
    }
    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'text-muted-foreground hover:text-foreground mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm transition-colors',
        className,
      )}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
