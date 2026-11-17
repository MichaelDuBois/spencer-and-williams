import { describe, expect, it } from 'vitest'

import { formatHours } from '@/utilities/formatHours'

describe('formatHours', () => {
  it('pads single-digit hours with a leading zero', () => {
    expect(formatHours(9, 17)).toBe('Open 09:00 – 17:00')
  })

  it('renders double-digit hours without extra padding', () => {
    expect(formatHours(16, 24)).toBe('Open 16:00 – 24:00')
  })

  it('renders 0 as 00:00', () => {
    expect(formatHours(0, 8)).toBe('Open 00:00 – 08:00')
  })
})
