const escapeAlgoliaFilterStringLiteral = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

export const toAlgoliaFilterStringLiteral = (value: string): string =>
  `"${escapeAlgoliaFilterStringLiteral(value)}"`

export const getObjectIdFilter = (objectID: string): string =>
  `objectID:${toAlgoliaFilterStringLiteral(objectID)}`

export const getObjectIdsFilter = (objectIDs: readonly string[]): string =>
  objectIDs.map(getObjectIdFilter).join(' OR ')

const groupDisjunction = (expression: string): string => {
  // Ignore quoted values and existing groups; Algolia rejects wrapping AND groups.
  const tokens =
    expression.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\(|\)|\bOR\b/g) ?? []
  let depth = 0
  for (const token of tokens) {
    if (token === '(') depth += 1
    else if (token === ')') depth -= 1
    else if (token === 'OR' && depth === 0) return `(${expression})`
  }
  return expression
}

export const combineAlgoliaFilters = (
  ...filters: (string | null | undefined)[]
): string =>
  filters
    .map((filter) => filter?.trim() ?? '')
    .filter(Boolean)
    .map(groupDisjunction)
    .join(' AND ')
