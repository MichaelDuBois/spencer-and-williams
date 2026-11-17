import type { LatLng } from '@/types/location.types'

export interface ArticleHitValues {
  objectID: string
  productUrl: string
  title: string
  subtitle?: string
  image?: string
  category?: string
  author?: string
  date?: string
  readTime?: number
  destinationType?: string[]
  season?: string[]
  budget?: string
  recommendedDurationDays?: number
  aiSummary?: string
  location?: string
  tags?: string[]
  body?: string[]
  keyQuotes?: string[]
  relatedActivities?: string[]
  _geoloc?: LatLng
}

export interface PodcastHitValues {
  objectID: string
  productUrl: string
  title: string
  image?: string
  episode?: string
  summary?: string
  hosts?: string[]
  guests?: string[]
  episodeNumber?: number
  duration?: number
  category?: string
  publishedAt?: string
  tags?: string[]
  topics?: string[]
  transcript?: { speaker: string; text: string }[]
  keyQuotes?: string[]
}

export interface ActivityHitValues {
  objectID: string
  productUrl: string
  parentID?: string
  title: string
  subtitle?: string
  description?: string
  image?: string
  location?: string
  country?: string
  duration?: number
  rating?: number
  _geoloc?: LatLng
}
