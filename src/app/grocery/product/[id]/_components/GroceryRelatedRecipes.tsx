'use client'

import { RecipeCard } from '@/app/grocery/_components/RecipeCard'
import { useGroceryRecipes } from '@/app/grocery/_hooks/useGroceryRecipes'
import { getRecipeIngredientFilters } from '@/app/grocery/_utils/getRecipeIngredientFilters'
import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'
import { CarouselSection } from '@/components/CarouselSection'

interface GroceryRelatedRecipesProps {
  product: GroceryProductHitValues
  className?: string
}

export const GroceryRelatedRecipes = ({
  product,
  className,
}: GroceryRelatedRecipesProps) => {
  const ingredientFilters = getRecipeIngredientFilters(product.type)
  const { recipes } = useGroceryRecipes({ ingredientFilters, hitsPerPage: 6 })

  if (recipes.length === 0) return null

  if (recipes.length === 1) {
    return (
      <section className={className}>
        <h2 className="text-foreground mb-4 text-2xl font-bold">
          Recipes using this
        </h2>
        <RecipeCard recipe={recipes[0]} />
      </section>
    )
  }

  return (
    <CarouselSection
      title="Recipes using this"
      variant="grocery"
      className={className}
      items={recipes}
      renderItem={(recipe) => <RecipeCard recipe={recipe} />}
    />
  )
}
