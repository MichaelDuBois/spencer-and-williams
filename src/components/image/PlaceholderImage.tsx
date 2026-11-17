'use client'

import Image from 'next/image'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { cn } from '@/lib/utils'

type PlaceholderImageProps = {
  fill?: boolean
  className?: string
  fallbackClassName?: string
}

export const PlaceholderImage = ({
  fill,
  className,
  fallbackClassName,
}: PlaceholderImageProps) => {
  const config = useActiveConfig()
  const placeholder = config?.assets.favicon || config?.assets.logo

  return (
    <div
      className={cn(
        'bg-muted flex items-center justify-center overflow-hidden',
        fill ? 'absolute inset-0' : 'h-full w-full',
        className,
        fallbackClassName,
      )}>
      {placeholder ? (
        <Image
          src={placeholder}
          alt=""
          aria-hidden
          width={96}
          height={96}
          className="h-2/5 max-h-16 w-auto max-w-[45%] object-contain opacity-80"
        />
      ) : (
        <span className="text-muted-foreground text-xs tracking-widest uppercase">
          No image
        </span>
      )}
    </div>
  )
}
