export const formatDate = (
  value: string | number | null | undefined,
): string | null => {
  if (value === null || value === undefined || value === '') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
