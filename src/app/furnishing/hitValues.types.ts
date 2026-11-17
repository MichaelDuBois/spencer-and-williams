import type { StoreAvailability } from '@/types/location.types'

export interface FurnishingProductHitValues {
  objectID: string
  productUrl: string
  name: string
  image?: string
  price?: number
  brand?: string
  description?: string
  category?: string
  hierarchicalCategories?: string[]
  rating?: number
  ratingsCount?: number
  popularity?: number
  sales?: number
  dimensions?: string
  material?: string
  frameMaterial?: string
  upholsteryFabric?: string
  roomType?: string
  assemblyRequired?: string
  color?: string
  style?: string
  productType?: string
  availableInStores?: StoreAvailability[]
}
