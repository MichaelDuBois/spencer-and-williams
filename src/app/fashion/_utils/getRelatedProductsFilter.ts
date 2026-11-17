import { fashionConfig } from '@/app/fashion/config'
import { toAlgoliaFilterStringLiteral } from '@/utilities/algoliaFilters'

/**
 * The articles-index filter matching articles that mention a product.
 * Undefined when there is nothing to filter on: only a single-path
 * `relatedProducts` mapping is filterable, and a multi-level one would mean
 * guessing which level to match.
 */
export const getRelatedProductsFilter = (
  objectID: string,
): string | undefined => {
  const attribute =
    fashionConfig.algolia.indices.articles.template?.attributes.relatedProducts

  if (!objectID || typeof attribute !== 'string') return undefined

  return `${attribute}:${toAlgoliaFilterStringLiteral(objectID)}`
}
