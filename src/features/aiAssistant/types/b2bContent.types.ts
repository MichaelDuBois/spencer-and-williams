import type {
  B2BContentArticleHitValues,
  B2BContentBlogHitValues,
  B2BContentDocumentationHitValues,
  B2BContentResourceHitValues,
} from '@/app/b2b-content/hitValues.types'
import type { B2BContentIndexKey } from '@/app/b2b-content/types'
import type {
  PartialVerticalDisplayGroup,
  VerticalDisplayGroup,
  VerticalDisplayItem,
  VerticalDisplayResultsData,
  VerticalSearchQuery,
} from '@/features/aiAssistant/types/core.types'

export type B2BContentType = B2BContentIndexKey

// Search / display shapes — derived from the generic Vertical* primitives.
export type B2BContentSearchQuery = VerticalSearchQuery<B2BContentType>
export type B2BContentDisplayItem = VerticalDisplayItem
export type B2BContentDisplayGroup = VerticalDisplayGroup<B2BContentType>
export type PartialB2BContentDisplayGroup =
  PartialVerticalDisplayGroup<B2BContentType>
export type B2BContentDisplayResultsData =
  VerticalDisplayResultsData<B2BContentType>

// Vertical-specific summary returned to the agent after search.
export interface B2BContentSummary {
  objectID: string
  type: B2BContentType
  title: string
  description?: string
  category?: string
  section?: string
  contentType?: string
  author?: string
}

// Cached B2B content data (from Algolia, populated by useB2BContentSearch).
// Each *HitValues interface already supplies objectID, title, productUrl;
// the `type` field acts as the discriminator for the union below.
export type B2BContentDocumentationData = B2BContentDocumentationHitValues & {
  type: 'documentation'
}

export type B2BContentArticleData = B2BContentArticleHitValues & {
  type: 'articles'
}

export type B2BContentBlogData = B2BContentBlogHitValues & {
  type: 'blogs'
}

export type B2BContentResourceData = B2BContentResourceHitValues & {
  type: 'resources'
}

export type B2BContentData =
  | B2BContentDocumentationData
  | B2BContentArticleData
  | B2BContentBlogData
  | B2BContentResourceData
