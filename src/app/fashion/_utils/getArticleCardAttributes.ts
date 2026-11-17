import type { FashionArticleHitTemplate } from '@/app/fashion/types'

/**
 * The index attributes JournalCard renders, resolved from the template so the
 * config stays the only place index attribute names are written. objectID is
 * derived rather than mapped, so it is requested by name.
 */
export const getArticleCardAttributes = (
  template: FashionArticleHitTemplate,
): string[] => {
  const { title, category, readingTime, thumbnail, image } = template.attributes

  return ['objectID', title, category, readingTime, thumbnail, image]
}
