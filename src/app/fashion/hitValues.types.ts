import type { HitColorVariant } from '@/components/hit/hit.types'
import type { StoreAvailability } from '@/types/location.types'
import type { ContentDataBlock } from '@/types/recordHit.types'

export interface FashionProductInfo {
  care_instructions?: string[]
  composition?: string
  country_of_origin?: string
  features?: string[]
  fit?: string
  season?: string
}

export interface FashionProductHitValues {
  objectID: string
  productUrl: string
  name: string
  brand?: string
  image?: string
  images?: string[]
  price?: number
  description?: string
  sizes?: string[]
  color?: string
  colorVariants?: HitColorVariant[]
  rating?: number
  reviewsCount?: number
  productInfo?: FashionProductInfo
  hierarchicalCategories?: string[]
  availableInStores?: StoreAvailability[]
}

export interface FashionArticleAuthor {
  name: string
  role?: string
  avatar?: string | null
}

export interface FashionArticleHitValues {
  objectID: string
  productUrl: string
  title: string
  subtitle?: string
  image?: string
  thumbnail?: string
  category?: string
  author?: FashionArticleAuthor
  publishedAt?: string
  publishedAtTimestamp?: number
  readingTime?: number
  seasonality?: string[]
  tags?: string[]
  excerpt?: string
  aiSummary?: string
  keyQuotes?: string[]
  body?: ContentDataBlock[]
  relatedCategories?: string[]
  relatedProducts?: string[]
  promoted?: boolean
}
