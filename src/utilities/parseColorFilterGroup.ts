import { colorMap } from '@/components/product/colorMap'

export interface ParsedColor {
  name: string
  hex: string
}

export const parseColorFilterGroup = (
  filterGroup: string,
): ParsedColor | null => {
  const [name, parsedHex] = filterGroup.split(';')
  if (!name) return null
  const hex = colorMap[name.toLowerCase()] ?? parsedHex
  if (!hex) return null
  return { name, hex }
}
