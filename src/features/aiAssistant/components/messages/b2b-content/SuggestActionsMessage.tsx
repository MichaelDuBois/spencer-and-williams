'use client'

import { ArrowUpRight } from 'lucide-react'

import { Image } from '@/components/image/Image'
import type {
  GartnerQuadrant,
  SuggestAction,
} from '@/features/aiAssistant/types'
import { cn } from '@/lib/utils'

const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

interface SuggestActionsMessageProps {
  actions: SuggestAction[]
  gartnerQuadrant?: GartnerQuadrant
}

export const SuggestActionsMessage = ({
  actions,
  gartnerQuadrant,
}: SuggestActionsMessageProps) => {
  const showGartner =
    !!gartnerQuadrant &&
    isSafeUrl(gartnerQuadrant.url) &&
    isSafeUrl(gartnerQuadrant.imageUrl)

  return (
    <div className="flex flex-col gap-3">
      {showGartner && (
        <div className="flex w-full max-w-sm flex-col gap-1.5">
          <span className="text-accent text-base font-medium">
            Gartner Magic Quadrant
          </span>
          <a
            href={gartnerQuadrant.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'rounded-image border-accent/20 block overflow-hidden border',
              'hover:border-accent/40 transition-colors',
            )}>
            <div className="relative aspect-square w-full">
              <Image
                src={gartnerQuadrant.imageUrl}
                alt="Gartner Magic Quadrant"
                fill
                className="object-contain p-3"
                sizes="(max-width: 640px) 100vw, 384px"
              />
            </div>
          </a>
        </div>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions
            .filter((action) => isSafeUrl(action.url))
            .map((action) => (
              <a
                key={`${action.url}-${action.label}`}
                href={action.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-1.5',
                  'rounded-button border-accent/20 bg-accent/5 border',
                  'text-accent px-3 py-1.5 text-sm font-medium',
                  'hover:bg-accent/10 transition-colors',
                )}>
                {action.label}
                <ArrowUpRight className="size-3.5" />
              </a>
            ))}
        </div>
      )}
    </div>
  )
}
