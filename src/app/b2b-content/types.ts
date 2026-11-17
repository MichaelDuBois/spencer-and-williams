import type {
  B2BContentArticleHitValues,
  B2BContentBlogHitValues,
  B2BContentDocumentationHitValues,
  B2BContentResourceHitValues,
} from '@/app/b2b-content/hitValues.types'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export const B2B_CONTENT_INDEX_KEYS = [
  'documentation',
  'articles',
  'blogs',
  'resources',
] as const

export type B2BContentIndexKey = (typeof B2B_CONTENT_INDEX_KEYS)[number]

export type B2BContentDocumentationHitTemplate =
  HitTemplate<B2BContentDocumentationHitValues>

export type B2BContentArticleHitTemplate =
  HitTemplate<B2BContentArticleHitValues>

export type B2BContentBlogHitTemplate = HitTemplate<B2BContentBlogHitValues>

export type B2BContentResourceHitTemplate =
  HitTemplate<B2BContentResourceHitValues>

export type B2BContentConfigType = CreateConfigType<
  B2BContentDocumentationHitTemplate,
  {
    articles: B2BContentArticleHitTemplate
    blogs: B2BContentBlogHitTemplate
    resources: B2BContentResourceHitTemplate
    aiSuggestions: undefined
  }
>
