'use client'

import { useIngredientProducts } from '@/app/grocery/_hooks/useIngredientProducts'
import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { groceryConfig } from '@/app/grocery/config'
import { Carousel } from '@/components/Carousel'
import { Hit } from '@/components/hit/Hit'
import { cn } from '@/lib/utils'

interface IngredientCarouselProps {
  ingredient: string
}

const ITEM_CLASSES = 'w-54 shrink-0'

const LoadingSkeleton = () => (
  <div className="flex gap-4 overflow-hidden pb-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className={cn(ITEM_CLASSES, 'space-y-3')}>
        <div className="bg-muted rounded-image aspect-square w-full animate-pulse" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
        <div className="bg-muted h-3 w-3/4 animate-pulse rounded" />
      </div>
    ))}
  </div>
)

export const IngredientCarousel = ({ ingredient }: IngredientCarouselProps) => {
  const { products, isLoading } = useIngredientProducts(ingredient)
  const template = groceryConfig.algolia.primaryIndex.template

  return (
    <section className="bg-accent-foreground rounded-card space-y-4 p-4 sm:p-6">
      <h2 className="text-foreground text-xl font-bold capitalize">
        {ingredient}
      </h2>

      {isLoading ? (
        <LoadingSkeleton />
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No matches for {ingredient}.
        </p>
      ) : (
        <Carousel gapClassName="gap-4" showGradient={false}>
          {products.map((hit) => (
            <div key={hit.objectID as string} className={ITEM_CLASSES}>
              <Hit
                variant="grocery"
                item={hit}
                template={template}
                slug="grocery"
                extractor={getGroceryProductHitValues}
                disableHighlight
              />
            </div>
          ))}
        </Carousel>
      )}
    </section>
  )
}
