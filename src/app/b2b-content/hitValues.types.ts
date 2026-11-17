import type { B2BContentDataBlock } from '@/types/recordHit.types'

export interface B2BContentDocumentationHitValues {
  objectID: string
  productUrl: string
  title: string
  description?: string
  docType?: string
  category?: string
  pageTitle?: string
  variations?: string[]
  url?: string
  breadcrumb: string[]
}

export interface B2BContentArticleHitValues {
  objectID: string
  productUrl: string
  title: string
  body?: B2BContentDataBlock[]
  category?: string
  section?: string
  updatedAt?: string
  promoted?: boolean
  outdated?: boolean
  voteSum?: number
  voteCount?: number
  breadcrumb: string[]
  labels?: string[]
  url?: string
}

export interface B2BContentBlogHitValues {
  objectID: string
  productUrl: string
  title: string
  description?: string
  body?: B2BContentDataBlock[]
  category?: string
  publishedAt?: string
  authorDisplay?: string
  image?: string
  url?: string
}

export interface B2BContentResourceHitValues {
  objectID: string
  productUrl: string
  title: string
  description?: string
  body?: B2BContentDataBlock[]
  docType?: string
  contentType?: string[]
  publishedAt?: string
  url?: string
  relatedProducts?: string[]
  relatedIndustries?: string[]
  relatedUseCases?: string[]
  image?: string
}
