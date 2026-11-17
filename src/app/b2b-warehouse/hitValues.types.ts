import type { StoreAvailability } from '@/types/location.types'

export interface B2BWarehouseProductHitValues {
  objectID: string
  productUrl: string
  name: string
  sku?: string
  brand?: string
  image?: string
  price?: number
  description?: string
  category?: string
  hierarchicalCategories?: string[]
  info?: Record<string, string>
  rating?: number
  reviewsCount?: number
  availableInStores?: StoreAvailability[]
}
