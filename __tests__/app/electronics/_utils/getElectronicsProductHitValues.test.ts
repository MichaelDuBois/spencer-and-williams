import { describe, expect, it } from 'vitest'

import { getElectronicsProductHitValues } from '@/app/electronics/_utils/getElectronicsProductHitValues'
import { electronicsConfig } from '@/app/electronics/config'

const template = electronicsConfig.algolia.primaryIndex.template!
const slug = 'electronics'

const baseHit = {
  objectID: 'B07P6NRTNW',
  name: 'Lenovo Ideapad 330 15.6" Laptop',
  brand: 'Lenovo',
  price: 266.99,
  attrs: {
    'CPU Model': 'AMD A Series',
    'Ram Memory Installed Size': '8 GB',
    'Hard Disk Size': '256 GB',
    'Operating System': 'Windows 10',
    'Screen Size': '15.6 Inches',
    Color: 'Purple',
  },
}

describe('getElectronicsProductHitValues', () => {
  it('builds the product URL from the slug and objectID', () => {
    const result = getElectronicsProductHitValues(baseHit, template, slug)
    expect(result.productUrl).toBe('/electronics/product/B07P6NRTNW')
  })

  it('maps the technical spec attributes from attrs.*', () => {
    const result = getElectronicsProductHitValues(baseHit, template, slug)
    expect(result.cpu).toBe('AMD A Series')
    expect(result.ram).toBe('8 GB')
    expect(result.hardDiskSize).toBe('256 GB')
    expect(result.os).toBe('Windows 10')
    expect(result.screenSize).toBe('15.6 Inches')
    expect(result.color).toBe('Purple')
  })

  it('derives New condition with a manufacturer warranty by default', () => {
    const result = getElectronicsProductHitValues(baseHit, template, slug)
    expect(result.condition).toBe('New')
    expect(result.warranty).toBe('1-year manufacturer warranty')
  })

  it('derives renewed condition and limited warranty from the name', () => {
    const result = getElectronicsProductHitValues(
      { ...baseHit, name: 'Apple iPhone X, 64GB, Silver (Renewed)' },
      template,
      slug,
    )
    expect(result.condition).toBe('Renewed')
    expect(result.warranty).toBe('90-day limited warranty')
  })

  it('prefers a real Condition attribute over the name heuristic', () => {
    const result = getElectronicsProductHitValues(
      { ...baseHit, attrs: { ...baseHit.attrs, Condition: 'Refurbished' } },
      template,
      slug,
    )
    expect(result.condition).toBe('Refurbished')
    expect(result.warranty).toBe('90-day limited warranty')
  })

  it('prefers a real Warranty attribute over the derived default', () => {
    const result = getElectronicsProductHitValues(
      { ...baseHit, attrs: { ...baseHit.attrs, Warranty: '2-year AppleCare+' } },
      template,
      slug,
    )
    expect(result.warranty).toBe('2-year AppleCare+')
  })
})
