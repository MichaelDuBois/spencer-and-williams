import type { FacetConfig } from '@/types'
import { getFacetAttribute } from '@/utilities/getFacetAttribute'

type FacetValues = Record<string, Record<string, number>>
type FacetStats = Record<string, { min?: number; max?: number }>

const INTRO = `[Index context: filterable attributes for the current catalog. Use these exact attributes and values in the search tool's \`filters\` parameter. Never invent an attribute or a value that is not listed here.`

// An Algolia filter expression has to quote an attribute name containing
// whitespace, and the agent copies these names verbatim.
const formatAttribute = (attribute: string): string =>
  /\s/.test(attribute) ? `"${attribute}"` : attribute

const buildValuesLine = (
  attribute: string,
  values: Record<string, number> | undefined,
): string | null => {
  const sortedValues = Object.entries(values ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([value]) => `"${value}"`)

  if (sortedValues.length === 0) return null

  return `${formatAttribute(attribute)}: ${sortedValues.join(', ')}`
}

const buildRangeLine = (
  attribute: string,
  stats: { min?: number; max?: number } | undefined,
): string | null => {
  if (stats?.min === undefined || stats.max === undefined) return null

  return `${formatAttribute(attribute)} (numeric): min ${stats.min}, max ${stats.max}`
}

/**
 * Formats the vertical's configured facets into the RAG block the agent reads
 * before choosing filters. Values stay verbatim — colour facets carry a
 * ";#hex" suffix that the UI strips but a filter has to match literally.
 */
export const buildIndexContext = (
  facets: FacetConfig[],
  facetValues?: FacetValues,
  facetStats?: FacetStats,
): string | null => {
  const lines = facets
    .map((facet) => {
      const attribute = getFacetAttribute(facet)

      return facet.type === 'slider'
        ? buildRangeLine(attribute, facetStats?.[attribute])
        : buildValuesLine(attribute, facetValues?.[attribute])
    })
    .filter((line): line is string => line !== null)

  if (lines.length === 0) return null

  return `${INTRO}\n${lines.join('\n')}]`
}
