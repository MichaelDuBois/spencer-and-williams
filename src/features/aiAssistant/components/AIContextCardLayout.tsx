'use client'

import { Eye } from 'lucide-react'

import { Image } from '@/components/image/Image'

import type { ReactNode } from 'react'

interface AIContextCardLayoutProps {
  label: string
  image?: string
  imageAlt: string
  imageFit?: 'contain' | 'cover'
  action?: ReactNode
  children: ReactNode
}

/**
 * Shared layout shell for AI page context cards (product, article, etc.).
 * Handles the outer wrapper, Eye icon header, image thumbnail, and text slot.
 */
export const AIContextCardLayout = ({
  label,
  image,
  imageAlt,
  imageFit = 'contain',
  action,
  children,
}: AIContextCardLayoutProps) => (
  <div className="flex justify-end">
    <div className="bg-muted/50 border-border rounded-card max-w-[90%] border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          <Eye className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
        {action}
      </div>

      <div className="bg-background border-border rounded-button flex w-fit max-w-full items-center gap-2 border p-1.5">
        {image && (
          <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="40px"
              className={
                imageFit === 'cover' ? 'object-cover' : 'object-contain'
              }
            />
          </div>
        )}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  </div>
)
