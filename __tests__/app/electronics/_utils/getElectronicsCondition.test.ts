import { describe, expect, it } from 'vitest'

import { getElectronicsCondition } from '@/app/electronics/_utils/getElectronicsCondition'

describe('getElectronicsCondition', () => {
  it('detects renewed products from the name', () => {
    expect(
      getElectronicsCondition('Apple iPhone X, 64GB, Silver (Renewed)'),
    ).toBe('Renewed')
  })

  it('detects refurbished products', () => {
    expect(getElectronicsCondition('Dell XPS 13 - Refurbished')).toBe(
      'Refurbished',
    )
  })

  it('detects open box products regardless of separator', () => {
    expect(getElectronicsCondition('Sony WH-1000XM4 Open Box')).toBe('Open Box')
    expect(getElectronicsCondition('Sony WH-1000XM4 (Open-Box)')).toBe(
      'Open Box',
    )
  })

  it('treats pre-owned as renewed', () => {
    expect(getElectronicsCondition('Pre-Owned Galaxy S21')).toBe('Renewed')
  })

  it('defaults to New when no condition keyword is present', () => {
    expect(getElectronicsCondition('Lenovo Ideapad 330 Laptop')).toBe('New')
  })

  it('is case-insensitive', () => {
    expect(getElectronicsCondition('NINTENDO SWITCH (RENEWED)')).toBe('Renewed')
  })

  it('defaults to New when the name is missing', () => {
    expect(getElectronicsCondition(undefined)).toBe('New')
  })
})
