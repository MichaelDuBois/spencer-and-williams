'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'

interface ChatImageMessageProps {
  imageUrl: string
  className?: string
}

export const ChatImageMessage = ({
  imageUrl,
  className,
}: ChatImageMessageProps) => (
  <div className={cn('rounded-image mb-2 overflow-hidden', className)}>
    <Image
      src={imageUrl}
      alt="Uploaded image"
      width={200}
      height={200}
      unoptimized
      className="h-auto max-h-48 w-auto max-w-[12rem] object-cover"
    />
  </div>
)
