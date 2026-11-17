const LEVEL_KEY_PATTERN = /^lvl\d+$/
const LEVEL_SEPARATOR = ' > '

const getSortedLevelValues = (hierarchy: Record<string, string>): string[] =>
  Object.keys(hierarchy)
    .filter((key) => LEVEL_KEY_PATTERN.test(key))
    .sort()
    .map((key) => hierarchy[key])
    .filter(Boolean)

const splitLevelPath = (level: string): string[] =>
  level
    .split(LEVEL_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean)

export const getHierarchyBreadcrumb = (
  hierarchy?: Record<string, string>,
): string[] => {
  if (!hierarchy) return []

  const levels = getSortedLevelValues(hierarchy)
  return levels.flatMap((level) => {
    const parts = splitLevelPath(level)
    const last = parts[parts.length - 1]
    return last ? [last] : []
  })
}
