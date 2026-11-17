import type { StoreAvailability } from '@/types/location.types'

export interface EcommerceProductHitValues {
  objectID: string
  productUrl: string
  name: string
  brand?: string
  image?: string
  price?: number
  description?: string
  category?: string
  hierarchicalCategories?: string[]
  availableInStores?: StoreAvailability[]
}
