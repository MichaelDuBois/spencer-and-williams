import { describe, expect, it } from 'vitest'

import {
  formatBudget,
  formatDate,
  formatDisplayLabel,
  formatLocation,
} from '@/app/travel/_utils/travelContentFormatters'

describe('formatDisplayLabel', () => {
  it('replaces dashes and underscores with spaces and title-cases words', () => {
    expect(formatDisplayLabel('beach-holiday')).toBe('Beach Holiday')
    expect(formatDisplayLabel('city_break')).toBe('City Break')
  })

  it('collapses repeated whitespace and trims', () => {
    expect(formatDisplayLabel('  long   weekend  ')).toBe('Long Weekend')
  })
})

describe('formatBudget', () => {
  it('falls back to "Flexible" for an empty budget', () => {
    expect(formatBudget('')).toBe('Flexible')
  })

  it('formats a provided budget label', () => {
    expect(formatBudget('low_budget')).toBe('Low Budget')
  })
})

describe('formatDate', () => {
  it('formats a dd-mm-yyyy string into a long en-GB date', () => {
    expect(formatDate('25-12-2024')).toBe('25 December 2024')
  })

  it('returns the original value when it is not a valid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})

describe('formatLocation', () => {
  it('joins the truthy parts with a comma', () => {
    expect(formatLocation('Paris', undefined, 'France')).toBe('Paris, France')
  })

  it('returns an empty string when every part is falsy', () => {
    expect(formatLocation(undefined, '')).toBe('')
  })
})
