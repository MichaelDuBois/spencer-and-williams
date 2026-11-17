'use client'

import NextImage, { type ImageProps } from 'next/image'
import { useState, type ReactNode } from 'react'

import { PlaceholderImage } from '@/components/image/PlaceholderImage'

type ImageWrapperProps = Omit<ImageProps, 'src'> & {
  src: string | null | undefined
  fallbackClassName?: string
  fallback?: ReactNode
}

export const Image = ({
  src,
  alt,
  fill,
  className,
  fallbackClassName,
  fallback,
  onError,
  ...imageProps
}: ImageWrapperProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const hasError = !!src && failedSrc === src

  if (src && !hasError) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        onError={(event) => {
          setFailedSrc(src)
          onError?.(event)
        }}
        {...imageProps}
      />
    )
  }

  if (fallback) return <>{fallback}</>

  return (
    <PlaceholderImage
      fill={fill}
      className={className}
      fallbackClassName={fallbackClassName}
    />
  )
}
