import type { StoreAvailability } from '@/types/location.types'

export interface ElectronicsProductHitValues {
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
  sales?: number
  screenSize?: string
  storage?: string
  hardDiskSize?: string
  os?: string
  cpu?: string
  ram?: string
  graphics?: string
  color?: string
  condition?: ElectronicsCondition
  warranty?: string
  availableInStores?: StoreAvailability[]
}

export type ElectronicsCondition =
  | 'New'
  | 'Renewed'
  | 'Refurbished'
  | 'Open Box'
