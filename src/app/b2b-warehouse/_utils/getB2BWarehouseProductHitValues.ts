import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import type { B2BWarehouseHitTemplate } from '@/app/b2b-warehouse/types'
import type { StoreAvailability } from '@/types/location.types'
import { createHitExtractor } from '@/utilities/createHitExtractor'
import { getByPath } from '@/utilities/getByPath'
import { isRecord } from '@/utilities/isRecord'

// Whole-string decimal: optional sign, digits, at most one decimal point with digits.
const DECIMAL_PRICE_PATTERN = /^[+-]?\d+(?:\.\d+)?$/

// Number.parseFloat accepts a valid prefix, so '1,299.00' would silently become 1.
// Anything not fully matching a plain decimal is rejected rather than repaired:
// thousands separators are locale-ambiguous ('1,299' is 1299 or 1.299), and a
// missing price makes the product unavailable, which is the safe money-path outcome.
const parseDecimalPrice = (raw: string): number | undefined => {
  const trimmed = raw.trim()
  if (!DECIMAL_PRICE_PATTERN.test(trimmed)) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

const getDisplaySku = (
  hit: Record<string, unknown>,
  template: B2BWarehouseHitTemplate,
): string | undefined => {
  const raw = getByPath(hit, template.attributes.sku)
  if (typeof raw === 'string') return raw || undefined
  if (!Array.isArray(raw)) return undefined

  const skus = raw.filter(
    (value): value is string => typeof value === 'string' && value !== '',
  )
  return skus.length > 0 ? skus.join(', ') : undefined
}

const parseStoreAvailability = (
  raw: unknown,
): StoreAvailability[] | undefined => {
  if (!Array.isArray(raw)) return undefined
  const valid = raw.flatMap((entry): StoreAvailability[] => {
    if (!isRecord(entry)) return []
    const { objectID, inStock } = entry
    if (typeof objectID !== 'string' || objectID === '') return []
    if (typeof inStock !== 'boolean') return []
    return [{ objectID, inStock }]
  })
  return valid.length > 0 ? valid : undefined
}

export const getB2BWarehouseProductHitValues = createHitExtractor<
  B2BWarehouseProductHitValues,
  B2BWarehouseHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/product/${objectID}`,
  imageFields: ['image'],
  // b2b_ns stores price as a number for ~84% of records but a string for ~10%; normalise to a number so consumers relying on the numeric contract don't break.
  derive: {
    sku: getDisplaySku,
    price: (hit) => {
      const raw = hit.price
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined
      if (typeof raw === 'string') return parseDecimalPrice(raw)
      return undefined
    },
    info: (hit) => {
      const raw = hit.info
      if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return undefined
      }
      const entries = Object.entries(raw as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      )
      return entries.length > 0 ? Object.fromEntries(entries) : undefined
    },
    rating: (hit) => {
      const value = (hit.reviews as { rating?: unknown } | undefined)?.rating
      return typeof value === 'number' ? value : undefined
    },
    reviewsCount: (hit) => {
      const value = (hit.reviews as { count?: unknown } | undefined)?.count
      return typeof value === 'number' ? value : undefined
    },
    availableInStores: (hit) => parseStoreAvailability(hit.availableInStores),
  },
})
