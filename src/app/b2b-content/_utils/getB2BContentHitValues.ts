import { getHierarchyBreadcrumb } from '@/app/b2b-content/_utils/getHierarchyBreadcrumb'
import type {
  B2BContentArticleHitValues,
  B2BContentBlogHitValues,
  B2BContentDocumentationHitValues,
  B2BContentResourceHitValues,
} from '@/app/b2b-content/hitValues.types'
import type {
  B2BContentArticleHitTemplate,
  B2BContentBlogHitTemplate,
  B2BContentDocumentationHitTemplate,
  B2BContentResourceHitTemplate,
} from '@/app/b2b-content/types'
import type {
  B2BContentBlogAuthor,
  B2BContentDataBlock,
} from '@/types/recordHit.types'
import { createHitExtractor } from '@/utilities/createHitExtractor'
import { formatDate } from '@/utilities/formatDate'
import { getByPath } from '@/utilities/getByPath'
import { groupContentBlocks } from '@/utilities/groupContentBlocks'

export const collapseBlocks = (
  blocks: B2BContentDataBlock[] | undefined,
): string | undefined => {
  if (!blocks) return undefined
  const text = groupContentBlocks(blocks)
    .filter((group) => group.type === 'text')
    .map((group) => group.text)
    .join(' ')
  return text || undefined
}

export const getB2BContentDocumentationHitValues = createHitExtractor<
  B2BContentDocumentationHitValues,
  B2BContentDocumentationHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/documentation/${objectID}`,
  derive: {
    breadcrumb: (hit, template) => {
      const path = template.attributes.breadcrumb
      if (typeof path !== 'string') return undefined
      return getHierarchyBreadcrumb(
        getByPath<Record<string, string>>(hit, path),
      )
    },
  },
})

export const getB2BContentArticleHitValues = createHitExtractor<
  B2BContentArticleHitValues,
  B2BContentArticleHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/articles/${objectID}`,
  derive: {
    updatedAt: (hit, template) =>
      formatDate(
        getByPath<string | number>(hit, template.attributes.updatedAt) ??
          getByPath<string | number>(hit, 'edited_at'),
      ) ?? undefined,
    breadcrumb: (hit, template) => {
      const path = template.attributes.breadcrumb
      if (typeof path !== 'string') return undefined
      return getHierarchyBreadcrumb(
        getByPath<Record<string, string>>(hit, path),
      )
    },
  },
})

export const getB2BContentBlogHitValues = createHitExtractor<
  B2BContentBlogHitValues,
  B2BContentBlogHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/blogs/${objectID}`,
  imageFields: ['image'],
  derive: {
    publishedAt: (hit, template) =>
      formatDate(
        getByPath<string | number>(hit, template.attributes.publishedAt),
      ) ?? undefined,
    authorDisplay: (hit, template) => {
      const authors = getByPath<B2BContentBlogAuthor[]>(
        hit,
        template.attributes.authorDisplay,
      )
      const display = authors
        ?.map((author) => author.name)
        .filter(Boolean)
        .join(', ')
      return display || undefined
    },
  },
})

export const getB2BContentResourceHitValues = createHitExtractor<
  B2BContentResourceHitValues,
  B2BContentResourceHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/resources/${objectID}`,
  imageFields: ['image'],
  derive: {
    publishedAt: (hit, template) =>
      formatDate(
        getByPath<string | number>(hit, template.attributes.publishedAt) ??
          getByPath<string | number>(hit, 'createddate'),
      ) ?? undefined,
  },
})
