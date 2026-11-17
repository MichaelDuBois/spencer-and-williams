import type { ElectronicsCondition } from '@/app/electronics/hitValues.types'

export const getElectronicsCondition = (
  name: string | undefined,
): ElectronicsCondition => {
  const value = name?.toLowerCase() ?? ''

  if (value.includes('open box') || value.includes('open-box')) {
    return 'Open Box'
  }
  if (value.includes('refurbished') || value.includes('refurb')) {
    return 'Refurbished'
  }
  if (
    value.includes('renewed') ||
    value.includes('pre-owned') ||
    value.includes('preowned')
  ) {
    return 'Renewed'
  }

  return 'New'
}
