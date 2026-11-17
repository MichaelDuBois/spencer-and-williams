'use client'

import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { ResultCarousel } from '@/features/aiAssistant/components/messages/ResultCarousel'
import { ResultGroupShell } from '@/features/aiAssistant/components/messages/ResultGroupShell'
import type { DisplayGroup } from '@/features/aiAssistant/types'

interface CarouselResultGroupProps extends ProductCarouselPresentation {
  group: DisplayGroup
  query?: string
}

const MAX_VISIBLE_PRODUCTS = 4

/** Completed result group: header + carousel of the vertical's product cards. */
export const CarouselResultGroup = ({
  group,
  query,
  card: Card,
  carouselClassName,
  containerClassName,
  titleClassName = 'font-semibold',
}: CarouselResultGroupProps) => (
  <ResultGroupShell
    title={group.title}
    why={group.why}
    query={query}
    className={containerClassName}
    titleClassName={titleClassName}>
    <ResultCarousel className={carouselClassName}>
      {group.products.slice(0, MAX_VISIBLE_PRODUCTS).map((product) => (
        <Card key={product.objectID} product={product} />
      ))}
    </ResultCarousel>
  </ResultGroupShell>
)
