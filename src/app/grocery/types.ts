import type {
  GroceryProductHitValues,
  RecipeHitValues,
} from '@/app/grocery/hitValues.types'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export type GroceryHitTemplate = HitTemplate<GroceryProductHitValues>

export type GroceryRecipeHitTemplate = HitTemplate<RecipeHitValues>

export type GroceryConfigType = CreateConfigType<
  GroceryHitTemplate,
  {
    querySuggestions: undefined
    aiSuggestions: undefined
    locations: undefined
    recipes: GroceryRecipeHitTemplate
  }
>
