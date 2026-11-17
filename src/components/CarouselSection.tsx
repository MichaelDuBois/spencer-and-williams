'use client'

import { Carousel } from '@/components/Carousel'
import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'

export type CarouselSectionVariant =
  | 'standard'
  | 'editorial'
  | 'grocery'
  | 'poster'

interface VariantClasses {
  title: string
  item: string
  gap: string
  /** The right-edge fade. White, so a dark theme has to opt out. */
  showGradient?: boolean
}

const VARIANT_CLASSES: Record<CarouselSectionVariant, VariantClasses> = {
  standard: {
    title: 'text-foreground text-2xl font-bold',
    item: 'w-72',
    gap: 'gap-6',
  },
  editorial: {
    title:
      'text-muted-foreground text-center text-xs tracking-[0.3em] uppercase',
    item: 'w-72',
    gap: 'gap-6',
  },
  grocery: {
    title: 'text-foreground text-2xl font-bold',
    item: 'w-54',
    gap: 'gap-4',
  },
  // 2:3 poster, not a product card — narrow slots, tight gap, media rail's heading weight.
  poster: {
    title: 'text-foreground text-lg font-semibold tracking-tight md:text-xl',
    item: 'w-36 sm:w-40',
    gap: 'gap-2 md:gap-3',
    // The fade is `from-white`, which on the dark media theme is a white smear.
    showGradient: false,
  },
}

/** `sizes` matching the 'poster' variant's item width, kept beside it. */
export const POSTER_ITEM_SIZES = '(min-width: 640px) 160px, 144px'

interface CarouselSectionProps<TItem extends { objectID: string }> {
  title: string
  subtitle?: string
  items: TItem[]
  renderItem: (item: TItem) => ReactNode
  className?: string
  variant?: CarouselSectionVariant
}

export const CarouselSection = <TItem extends { objectID: string }>({
  title,
  subtitle,
  items,
  renderItem,
  className,
  variant = 'standard',
}: CarouselSectionProps<TItem>) => {
  if (!items.length) return null

  const classes = VARIANT_CLASSES[variant]

  return (
    <section className={className}>
      <div className="mb-8">
        <h2 className={classes.title}>{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <Carousel gapClassName={classes.gap} showGradient={classes.showGradient}>
        {items.map((item) => (
          <div key={item.objectID} className={cn(classes.item, 'shrink-0')}>
            {renderItem(item)}
          </div>
        ))}
      </Carousel>
    </section>
  )
}
