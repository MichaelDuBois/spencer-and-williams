'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { groceryConfig } from '@/app/grocery/config'
import type {
  GroceryProductHitValues,
  RecipeStep,
} from '@/app/grocery/hitValues.types'
import {
  getUniqueIngredients,
  type RecipeIngredient,
} from '@/app/grocery/recipe/[id]/_utils/recipeIngredients'
import { useSearchClient } from '@/hooks/useSearchClient'

export interface ResolvedIngredient extends RecipeIngredient {
  product: GroceryProductHitValues | null
}

interface UseRecipeIngredientProductsArgs {
  recipeId: string
  steps: RecipeStep[] | undefined
}

export const useRecipeIngredientProducts = ({
  recipeId,
  steps,
}: UseRecipeIngredientProductsArgs) => {
  const { client: searchClient, key: searchClientKey } = useSearchClient()
  const productIndexName = groceryConfig.algolia.primaryIndex.name
  const productTemplate = groceryConfig.algolia.primaryIndex.template

  const ingredients = useMemo(() => getUniqueIngredients(steps), [steps])

  const query = useQuery<ResolvedIngredient[]>({
    // The client's identity belongs in the key: it decides which pipeline
    // answers, and without it products fetched through the composition stay
    // cached under the same key after the toggle is switched off.
    queryKey: [
      'recipeIngredientProducts',
      recipeId,
      ingredients.map((ingredient) => ingredient.ingredient),
      searchClientKey,
    ],
    enabled: !!searchClient && !!productTemplate && ingredients.length > 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!searchClient || !productTemplate) {
        throw new Error('Search client or product template not available')
      }

      const { results } = await searchClient.search<Record<string, unknown>>(
        ingredients.map((ingredient) => {
          return {
            indexName: productIndexName,
            params: { query: ingredient.label, hitsPerPage: 1 },
          }
        }),
      )

      return ingredients.map((ingredient, index) => {
        const result = results[index]
        const hit = result && 'hits' in result ? result.hits[0] : undefined
        const product = hit
          ? getGroceryProductHitValues(hit, productTemplate, 'grocery')
          : null
        return { ...ingredient, product }
      })
    },
  })

  const resolved = useMemo(() => query.data ?? [], [query.data])

  const matchedProducts = useMemo(
    () =>
      resolved.filter(
        (
          item,
        ): item is ResolvedIngredient & {
          product: GroceryProductHitValues
        } => item.product !== null,
      ),
    [resolved],
  )

  return {
    ingredients: resolved,
    matchedProducts,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
