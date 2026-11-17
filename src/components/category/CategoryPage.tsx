'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Configure, Index } from 'react-instantsearch'

import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import { getB2BCatalogFilters } from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import type { NavigationItem } from '@/types/verticalConfig.types'
import { combineAlgoliaFilters } from '@/utilities/algoliaFilters'
import { getFilter } from '@/utilities/getSlug'

interface CategoryPageProps {
  indexId: string
  children: (title: string, category: string) => React.ReactNode
}

const flattenNavCategories = (items?: NavigationItem[]): string[] => {
  if (!items) return []
  return items.flatMap((item) => [
    item.category,
    ...flattenNavCategories(item.children),
  ])
}

const findNavItem = (
  items: NavigationItem[] | undefined,
  category: string,
): NavigationItem | undefined => {
  if (!items) return undefined
  for (const item of items) {
    if (item.category === category) return item
    const found = findNavItem(item.children, category)
    if (found) return found
  }
  return undefined
}

export const CategoryPage = ({ indexId, children }: CategoryPageProps) => {
  const { slug: urlSlug } = useParams<{ slug: string }>()
  const config = useActiveConfig()
  const policy = useB2BCustomerGroupPolicy()
  const storeId = useSearchParams().get('storeId')
  useScrollToTop()

  if (!config) return null

  const navigationCategories = flattenNavCategories(config.navigation)
  const carouselCategories =
    config.carouselCategories?.map((c) => c.category) ?? []
  const categories = [
    ...new Set([...navigationCategories, ...carouselCategories]),
  ]
  const categoryAttribute =
    config.merchandising?.categoryAttribute ?? 'categoryPageId'

  const { name: categoryName, filter: categoryFilter } = getFilter(urlSlug, {
    items: categories,
    attribute: categoryAttribute,
  })

  const separator = config.merchandising?.nestedSeparator ?? ' > '
  // Label hierarchy: navigation > carousel > last segment of category name
  const label =
    findNavItem(config.navigation, categoryName)?.label ??
    config.carouselCategories?.find((c) => c.category === categoryName)
      ?.label ??
    categoryName.split(separator).pop()?.trim() ??
    categoryName

  const storeFilter = storeId ? `availableInStores.objectID:"${storeId}"` : null
  const filters = combineAlgoliaFilters(
    categoryFilter,
    policy.status === 'inactive' ? storeFilter : getB2BCatalogFilters(policy),
  )
  const ruleContexts =
    policy.status === 'ready' && policy.groupId ? [policy.groupId] : undefined

  const indexName = config.algolia.primaryIndex.name

  return (
    <Index indexName={indexName} indexId={indexId}>
      <Configure
        filters={filters}
        {...(ruleContexts && { ruleContexts })}
        query=""
      />
      {children(label, categoryName)}
    </Index>
  )
}
