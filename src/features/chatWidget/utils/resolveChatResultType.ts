import { b2bContentConfig } from '@/app/b2b-content/config'
import { fashionConfig } from '@/app/fashion/config'
import { groceryConfig } from '@/app/grocery/config'
import { travelConfig } from '@/app/travel/config'
import type {
  B2BContentType,
  TravelContentType,
} from '@/features/aiAssistant/types'

const hasField = (hit: Record<string, unknown>, field: string) =>
  hit[field] !== undefined && hit[field] !== null

export const getTravelResultType = (
  hit: Record<string, unknown>,
): TravelContentType => {
  if (hit.__indexName === travelConfig.algolia.indices.podcasts.name)
    return 'podcasts'
  if (hit.__indexName === travelConfig.algolia.indices.activities.name)
    return 'activities'
  if (hit.__indexName === travelConfig.algolia.primaryIndex.name)
    return 'articles'

  if (
    hasField(hit, 'cover_image') ||
    hasField(hit, 'episode_number') ||
    hasField(hit, 'host_names')
  )
    return 'podcasts'

  if (
    hasField(hit, 'parentID') ||
    hasField(hit, 'travel_time_minutes') ||
    hasField(hit, 'country')
  )
    return 'activities'

  return 'articles'
}

export const getB2BContentResultType = (
  hit: Record<string, unknown>,
): B2BContentType => {
  if (hit.__indexName === b2bContentConfig.algolia.indices.blogs.name)
    return 'blogs'
  if (hit.__indexName === b2bContentConfig.algolia.indices.resources.name)
    return 'resources'
  if (hit.__indexName === b2bContentConfig.algolia.indices.articles.name)
    return 'articles'
  if (hit.__indexName === b2bContentConfig.algolia.primaryIndex.name)
    return 'documentation'

  if (
    hasField(hit, 'blogimage') ||
    hasField(hit, 'blogcategory') ||
    hasField(hit, 'authors')
  )
    return 'blogs'

  if (
    hasField(hit, 'thumbnailImage') ||
    hasField(hit, 'resourceType') ||
    hasField(hit, 'relatedProducts')
  )
    return 'resources'

  if (
    hasField(hit, 'section') ||
    hasField(hit, 'updated_at') ||
    hasField(hit, 'data_transformed')
  )
    return 'articles'

  return 'documentation'
}

export type FashionResultType = 'articles' | 'products'

export const getFashionResultType = (
  hit: Record<string, unknown>,
): FashionResultType => {
  if (hit.__indexName === fashionConfig.algolia.indices.articles.name)
    return 'articles'
  if (hit.__indexName === fashionConfig.algolia.primaryIndex.name)
    return 'products'

  if (
    hasField(hit, 'title') ||
    hasField(hit, 'banner_image') ||
    hasField(hit, 'thumbnail_image') ||
    hasField(hit, 'reading_time') ||
    hasField(hit, 'excerpt')
  )
    return 'articles'

  return 'products'
}

export type GroceryResultType = 'recipes' | 'products'

export const getGroceryResultType = (
  hit: Record<string, unknown>,
): GroceryResultType => {
  if (hit.__indexName === groceryConfig.algolia.indices.recipes.name)
    return 'recipes'
  if (hit.__indexName === groceryConfig.algolia.primaryIndex.name)
    return 'products'

  if (hasField(hit, 'steps') || hasField(hit, 'attrs')) return 'recipes'

  return 'products'
}
