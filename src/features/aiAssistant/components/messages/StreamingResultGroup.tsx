'use client'

import { AnimatePresence, motion } from 'motion/react'

import { ProductCardSkeleton } from '@/features/aiAssistant/components/messages/ProductCardSkeleton'
import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { ResultCarousel } from '@/features/aiAssistant/components/messages/ResultCarousel'
import type { PartialDisplayGroup } from '@/features/aiAssistant/types'
import { EASE_SMOOTH } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface StreamingResultGroupProps extends ProductCarouselPresentation {
  group: PartialDisplayGroup
}

/** In-progress result group: header + animated cards + a trailing skeleton. */
export const StreamingResultGroup = ({
  group,
  card: Card,
  carouselClassName,
  containerClassName,
  titleClassName = 'font-semibold',
  skeletonVariant,
}: StreamingResultGroupProps) => (
  <div className={cn('space-y-3', containerClassName)}>
    <div>
      <h4 className={cn('text-sm', titleClassName)}>{group.title || '...'}</h4>
      {group.why && (
        <p className="text-muted-foreground mt-0.5 text-xs">{group.why}</p>
      )}
    </div>
    <ResultCarousel className={carouselClassName}>
      <AnimatePresence initial={false}>
        {group.products.map((product) => (
          <motion.div
            key={product.objectID}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: EASE_SMOOTH }}
            className="h-full shrink-0">
            <Card product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
      {!group.itemsComplete && (
        <ProductCardSkeleton variant={skeletonVariant} />
      )}
    </ResultCarousel>
  </div>
)
