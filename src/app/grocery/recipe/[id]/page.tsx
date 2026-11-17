'use client'

import { useParams } from 'next/navigation'

import { getGroceryRecipeHitValues } from '@/app/grocery/_utils/getGroceryRecipeHitValues'
import { groceryConfig } from '@/app/grocery/config'
import {
  RecipeHero,
  RecipeShoppingList,
  RecipeSteps,
} from '@/app/grocery/recipe/[id]/_components'
import { BackToResults } from '@/components/BackToResults'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { ProductLoadingState } from '@/components/product/ProductLoadingState'
import { useExtractedHit } from '@/hooks/useExtractedHit'

const RecipePage = () => {
  const params = useParams()
  const recipeId = params.id as string
  const { slug, algolia } = groceryConfig
  const recipesIndex = algolia.indices.recipes

  const {
    data: recipe,
    isLoading,
    isError,
  } = useExtractedHit(recipeId, {
    template: recipesIndex.template,
    extractor: getGroceryRecipeHitValues,
    indexName: recipesIndex.name,
  })

  if (isLoading) {
    return <ProductLoadingState />
  }

  if (isError || !recipe) {
    return (
      <PdpNotFoundState
        title="Recipe not found"
        backHref={`/${slug}/search`}
        backLabel="Back to groceries"
      />
    )
  }

  const steps = recipe.steps ?? []
  const hasSteps = steps.length > 0

  return (
    <div className="container mx-auto px-6 py-8">
      <BackToResults
        fallbackHref={`/${slug}/search`}
        label="Back to groceries"
      />

      <div className="mt-4">
        <RecipeHero recipe={recipe} />
      </div>

      {hasSteps && (
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_minmax(0,380px)]">
          <RecipeSteps steps={steps} />
          <RecipeShoppingList recipeId={recipe.objectID} steps={steps} />
        </div>
      )}
    </div>
  )
}

export default RecipePage
