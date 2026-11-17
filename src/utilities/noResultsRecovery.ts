import type { FacetConfig, NavigationItem } from '@/types/verticalConfig.types'
import { getSlug } from '@/utilities/getSlug'

interface CarouselCategory {
  category: string
  label?: string
}

interface CategoryRecoveryLink {
  label: string
  href: string
}

export const NO_RESULTS_ASSISTANT = {
  title: 'Need help finding it?',
  description: 'Ask our shopping assistant for a recommendation.',
  ctaLabel: 'Ask the assistant',
  promptTemplate: 'Help me find {query}',
} as const

export const NO_RESULTS_SUGGESTIONS = {
  title: 'Try a different search',
  limit: 3,
} as const

export const NO_RESULTS_CATEGORIES = {
  title: 'Browse popular categories',
  limit: 4,
} as const

export const interpolateRecoveryPrompt = (
  template: string,
  query: string,
): string => template.replaceAll('{query}', query)

export const getNoResultsAssistantContext = (query: string): string =>
  `[Search recovery context: The customer searched for "${query}" and the product search returned zero results. Open empathetically by saying you could not find an exact match for their query, then help them recover. If the query may be misspelled, lead with a likely correction such as "Did you mean …?". Otherwise, recommend concrete relevant alternatives, products, or categories with language such as "You might be interested in …". Do not stop at reporting the failed search.]`

export const getRootCategoryAttribute = (
  facets: FacetConfig[] | undefined,
): string | undefined => {
  const attribute = facets?.find(
    ({ type }) => type === 'hierarchical',
  )?.attribute

  return typeof attribute === 'string' ? attribute : attribute?.[0]
}

const findNavigationLabel = (
  items: NavigationItem[] | undefined,
  category: string,
): string | undefined => {
  for (const item of items ?? []) {
    if (item.category === category) return item.label
    const childLabel = findNavigationLabel(item.children, category)
    if (childLabel) return childLabel
  }
  return undefined
}

export const getKnownCategoryValues = ({
  navigation,
  carouselCategories,
}: {
  navigation?: NavigationItem[]
  carouselCategories?: CarouselCategory[]
}): Set<string> => {
  const flattenNavigation = (items: NavigationItem[] = []): string[] =>
    items.flatMap((item) => [
      item.category,
      ...flattenNavigation(item.children),
    ])

  return new Set([
    ...flattenNavigation(navigation),
    ...(carouselCategories?.map(({ category }) => category) ?? []),
  ])
}

export const getCategoryRecoveryLink = ({
  basePath,
  category,
  navigation,
  carouselCategories,
}: {
  basePath: string
  category: string
  navigation?: NavigationItem[]
  carouselCategories?: CarouselCategory[]
}): CategoryRecoveryLink => {
  const carouselLabel = carouselCategories?.find(
    (item) => item.category === category,
  )?.label

  return {
    label:
      findNavigationLabel(navigation, category) ?? carouselLabel ?? category,
    href: `${basePath}/category/${getSlug(category)}`,
  }
}
