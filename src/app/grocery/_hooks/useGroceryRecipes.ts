'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { getGroceryRecipeHitValues } from '@/app/grocery/_utils/getGroceryRecipeHitValues'
import { groceryConfig } from '@/app/grocery/config'
import type { RecipeHitValues } from '@/app/grocery/hitValues.types'
import { searchClientAtom } from '@/stores/searchClient'

interface UseGroceryRecipesArgs {
  ingredientFilters?: string[]
  hitsPerPage?: number
}

export const useGroceryRecipes = ({
  ingredientFilters = [],
  hitsPerPage = 12,
}: UseGroceryRecipesArgs = {}) => {
  const searchClient = useAtomValue(searchClientAtom)
  const recipesIndex = groceryConfig.algolia.indices.recipes

  const { data, isLoading, isError } = useQuery<RecipeHitValues[]>({
    queryKey: ['groceryRecipes', ingredientFilters, hitsPerPage],
    enabled: !!searchClient && ingredientFilters.length > 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!searchClient) throw new Error('Search client not available')
      if (!recipesIndex.template) return []

      const { results } = await searchClient.search<Record<string, unknown>>([
        {
          indexName: recipesIndex.name,
          params: {
            query: '',
            hitsPerPage,
            facetFilters: [
              ingredientFilters.map((value) => `steps.ingredient:${value}`),
            ],
          },
        },
      ])

      const result = results[0]
      const hits = result && 'hits' in result ? result.hits : []

      return hits.map((hit) =>
        getGroceryRecipeHitValues(hit, recipesIndex.template!, 'grocery'),
      )
    },
  })

  return { recipes: data ?? [], isLoading, isError }
}
