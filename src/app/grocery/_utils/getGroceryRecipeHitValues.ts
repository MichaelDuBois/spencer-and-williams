import type { RecipeHitValues } from '@/app/grocery/hitValues.types'
import type { GroceryRecipeHitTemplate } from '@/app/grocery/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'

export const getGroceryRecipeHitValues = createHitExtractor<
  RecipeHitValues,
  GroceryRecipeHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/recipe/${objectID}`,
  imageFields: ['image'],
})
