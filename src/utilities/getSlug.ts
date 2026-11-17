import { toAlgoliaFilterStringLiteral } from '@/utilities/algoliaFilters'

export const getSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[&,>/]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const getNameFromSlug = (slug: string, items: string[]): string =>
  items.find((name) => getSlug(name) === slug) ??
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

interface FilterConfig {
  items: string[]
  attribute: string
}

export const getFilter = (
  slug: string,
  config: FilterConfig,
): { name: string; filter: string } => {
  const name = getNameFromSlug(slug, config.items)
  return {
    name,
    filter: `${config.attribute}:${toAlgoliaFilterStringLiteral(name)}`,
  }
}
