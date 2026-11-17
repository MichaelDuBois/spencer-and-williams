'use client'

import { useState } from 'react'

import { Image } from '@/components/image/Image'
import { cn } from '@/lib/utils'

type GalleryVariant = 'product' | 'editorial'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  variant?: GalleryVariant
}

const VARIANT_CLASSES: Record<
  GalleryVariant,
  {
    mainContainer: string
    mainImage: string
    thumbContainer: string
    thumbActive: string
    thumbInactive: string
    thumbImage: string
  }
> = {
  product: {
    mainContainer:
      'border-border rounded-card relative aspect-square overflow-hidden border',
    mainImage: 'object-contain p-8',
    thumbContainer:
      'rounded-image relative aspect-square w-1/4 cursor-pointer overflow-hidden border-2 transition-colors',
    thumbActive: 'border-accent',
    thumbInactive: 'border-border hover:border-foreground/30',
    thumbImage: 'object-contain p-2',
  },
  editorial: {
    mainContainer: 'bg-muted relative aspect-3/4 overflow-hidden',
    mainImage: 'object-cover',
    thumbContainer:
      'bg-muted relative aspect-3/4 flex-1 cursor-pointer overflow-hidden border transition-colors',
    thumbActive: 'border-foreground',
    thumbInactive: 'border-transparent hover:border-foreground/30',
    thumbImage: 'object-cover',
  },
}

export const ProductImageGallery = ({
  images,
  productName,
  variant = 'product',
}: ProductImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const displayImages = images.length > 0 ? images : ['']
  const classes = VARIANT_CLASSES[variant]
  const safeIndex = Math.min(activeIndex, displayImages.length - 1)

  return (
    <div className="flex flex-col gap-4">
      <div className={classes.mainContainer}>
        <Image
          key={displayImages[safeIndex]}
          src={displayImages[safeIndex]}
          alt={productName}
          fill
          preload={safeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={classes.mainImage}
        />
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-3">
          {displayImages.slice(0, 12).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={safeIndex === index}
              className={cn(
                classes.thumbContainer,
                safeIndex === index
                  ? classes.thumbActive
                  : classes.thumbInactive,
              )}>
              <Image
                src={image}
                alt={`${productName} view ${index + 1}`}
                fill
                sizes="20vw"
                className={classes.thumbImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
