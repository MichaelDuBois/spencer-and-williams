'use client'

import { ListChecks } from 'lucide-react'

import { IngredientCarousel } from '@/app/grocery/_components/IngredientCarousel'

interface IngredientCarouselsSectionProps {
  ingredients: string[]
}

export const IngredientCarouselsSection = ({
  ingredients,
}: IngredientCarouselsSectionProps) => {
  if (ingredients.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-card flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-20 text-center">
        <ListChecks className="h-10 w-10" />
        <p className="text-foreground text-lg font-semibold">
          Your grocery list is empty
        </p>
        <p className="max-w-sm text-sm">
          Add ingredients or import a photo of a shopping list to see matching
          products from our store.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {ingredients.map((ingredient) => (
        <IngredientCarousel key={ingredient} ingredient={ingredient} />
      ))}
    </div>
  )
}
