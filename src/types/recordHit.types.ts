import type { GenericLocation } from '@/types/location.types'

export interface AISuggestionHit {
  objectID: string
  query: string
}

export type RecordHit =
  | FashionProductHit
  | EcommerceProductHit
  | ArticleHit
  | RelatedActivityHit
  | TravelPodcastHit
  | B2BContentDocumentationHit
  | B2BContentArticleHit
  | B2BContentBlogHit
  | B2BContentResourceHit
  | GenericLocation

export interface B2BContentDocumentationHit {
  objectID: string
  title: string
  page_title?: string
  description?: string
  url?: string
  type?: string
  variations?: string[]
  content_structure?: Record<string, string>
}

export interface B2BContentArticleHit {
  objectID: string
  title: string
  url?: string
  data_transformed?: B2BContentDataBlock[]
  category?: { name: string; id: number }
  section?: { name: string; id: number }
  hierarchy?: Record<string, string>
  content_tags?: string[]
  label_names?: string[]
  promoted?: boolean
  outdated?: boolean
  vote_sum?: number
  vote_count?: number
  created_at?: number
  updated_at?: number
  edited_at?: number
}

export interface B2BContentBlogAuthor {
  name: string
  desc?: string
  imgpath?: string
}

export interface B2BContentBlogHit {
  objectID: string
  title: string
  description?: string
  data_transformed?: B2BContentDataBlock[]
  publishDate?: string | number
  blogdate?: string
  blogdate_timestamp?: number
  createddate?: number
  authors?: B2BContentBlogAuthor[]
  blogcategory?: string
  blogimage?: string
  rewriteurl?: string
  parentObjectID?: string
  websitelanguage?: string
}

/**
 * Structured editorial body block, shared by B2B content and fashion articles.
 * Only `list` varies: fashion articles carry every bullet of a section as an
 * array, B2B content emits one bullet per block as a string.
 */
export type ContentDataBlock =
  | { type: 'text' | 'heading'; text: string }
  | { type: 'list'; text: string | string[] }

export type B2BContentDataBlock = ContentDataBlock

export interface B2BContentResourceHit {
  objectID: string
  title: string
  description?: string
  data_transformed?: B2BContentDataBlock[]
  publishDate?: string | number
  createddate?: number
  resourceType?: string
  contentType?: string[]
  relatedProducts?: string[]
  relatedIndustries?: string[]
  relatedUseCases?: string[]
  relatedJobRoles?: string[]
  thumbnailImage?: string
  rewriteurl?: string
  parentObjectID?: string
  websitelanguage?: string
  path?: string
}

export interface FashionProductHit {
  objectID: string
  name: string
  brand?: string
  description?: string
  price?: number
  primary_image?: string
  available_sizes?: string[]
}

export interface EcommerceProductHit {
  objectID: string
  brand: string
  name: string
  description?: string
  price?: number
  image?: string
  category?: string
}

export interface ArticleHit {
  objectID: string
  title: string
  destination_type: string[]
  season: string[]
  budget: string
  ai_summary: string
  created_at: string
  location: {
    country: string
    region: string
  }
  recommended_duration_days: number
  image: string
  author: string
  tags: string[]
  geo: {
    lat: number
    lng: number
  }
  related_activities: string[]
  subtitle: string
  time_to_read: number
  body: string[]
  key_quotes: string[]
}

export interface RelatedActivityHit {
  objectID: string
  title: string
  subtitle: string
  description: string
  type: string
  image: string
  price_level: string
  tags: string[]
  location: string
  country: string
  geo: {
    lat: number
    lng: number
  }
  travel_time_minutes: number
  rating: number
  review_count: number
  parentID: string
}

export interface TravelPodcastHit {
  objectID: string
  title: string
  episode: string
  summary: string
  episode_number: number
  published_at: string
  host_names: string[]
  guest_names: string[]
  category: string
  tags: string[]
  topics: string[]
  cover_image: string
  time_to_listen_minutes: number
  transcript: { speaker: string; text: string }[]
  key_quotes: string[]
}
