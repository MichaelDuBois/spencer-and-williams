import { b2bContentConfig } from '@/app/b2b-content/config'
import type { B2BContentIndexKey } from '@/app/b2b-content/types'
import type {
  B2BContentArticleHitTemplate,
  B2BContentBlogHitTemplate,
  B2BContentDocumentationHitTemplate,
  B2BContentResourceHitTemplate,
} from '@/app/b2b-content/types'
import type { IndexConfig } from '@/types'

type B2BContentTemplateMap = {
  documentation: B2BContentDocumentationHitTemplate
  articles: B2BContentArticleHitTemplate
  blogs: B2BContentBlogHitTemplate
  resources: B2BContentResourceHitTemplate
}

export const getIndexConfig = <K extends B2BContentIndexKey>(
  key: K,
): IndexConfig<B2BContentTemplateMap[K]> =>
  (key === 'documentation'
    ? b2bContentConfig.algolia.primaryIndex
    : b2bContentConfig.algolia.indices[
        key as Exclude<B2BContentIndexKey, 'documentation'>
      ]) as IndexConfig<B2BContentTemplateMap[K]>
