export const formatDisplayLabel = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())

export const formatBudget = (budget: string) =>
  budget ? formatDisplayLabel(budget) : 'Flexible'

export const formatDate = (value: string) => {
  const [day, month, year] = value.split('-').map(Number)

  if (
    Number.isInteger(day) &&
    Number.isInteger(month) &&
    Number.isInteger(year)
  ) {
    const parsedDate = new Date(Date.UTC(year, month - 1, day))

    if (!Number.isNaN(parsedDate.getTime())) {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(parsedDate)
    }
  }

  return value
}

export const formatLocation = (...values: Array<string | undefined>) =>
  values.filter(Boolean).join(', ')
