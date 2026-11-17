export interface GroceryNutrition {
  calories?: string
  totalFat?: string
  saturatedFat?: string
  transFat?: string
  monounsaturatedFat?: string
  polyunsaturatedFat?: string
  cholesterol?: string
  sodium?: string
  carbohydrate?: string
  dietaryFiber?: string
  sugars?: string
  addedSugars?: string
  protein?: string
  calcium?: string
  iron?: string
  potassium?: string
  vitaminD?: string
  servingSize?: string
}

export interface GroceryStoreAvailability {
  inStock: boolean
  objectID: string
}

export interface GrocerySemanticAttributes {
  allergens?: string
  countryOfOrigin?: string
  cuisine?: string
  dietaryConsiderations?: string[]
  packQuantity?: string
  preparationTime?: string
  seasonal?: string
  servingSuggestions?: string[]
  spiceLevel?: string
  storage?: string
}

export interface RecipeAttr {
  key: string
  val: string
}

export interface RecipeStep {
  title: string
  ingredient: string
  quantity: number
  unit: string
  explanation: string
}

export interface RecipeHitValues {
  objectID: string
  productUrl: string
  name: string
  description?: string
  image?: string
  attrs?: RecipeAttr[]
  steps?: RecipeStep[]
}

export interface GroceryProductHitValues {
  objectID: string
  productUrl: string
  name: string
  brand?: string
  image?: string
  price?: number
  description?: string
  category?: string
  hierarchicalCategories?: string[]
  rating?: number
  ratingsCount?: number
  popularity?: number
  sales?: number
  storeBrand?: boolean
  isFood?: boolean
  type?: string
  keywords?: string[]
  weight?: number
  nutrition?: GroceryNutrition
  availableInStores?: GroceryStoreAvailability[]
  semanticAttributes?: GrocerySemanticAttributes
}
