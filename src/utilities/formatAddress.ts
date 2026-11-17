export const formatAddress = (address: string): string[] =>
  address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
