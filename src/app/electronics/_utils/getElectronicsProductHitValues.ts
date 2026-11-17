import { getElectronicsCondition } from '@/app/electronics/_utils/getElectronicsCondition'
import type {
  ElectronicsCondition,
  ElectronicsProductHitValues,
} from '@/app/electronics/hitValues.types'
import type { ElectronicsHitTemplate } from '@/app/electronics/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'
import { getByPath } from '@/utilities/getByPath'

const conditionCache = new WeakMap<object, ElectronicsCondition>()

const resolveCondition = (
  hit: Record<string, unknown>,
  template: ElectronicsHitTemplate,
): ElectronicsCondition => {
  const cached = conditionCache.get(hit)
  if (cached) return cached

  const rawCondition = getByPath<string>(hit, template.attributes.condition)
  const condition = rawCondition
    ? (rawCondition as ElectronicsCondition)
    : getElectronicsCondition(hit.name as string | undefined)

  conditionCache.set(hit, condition)
  return condition
}

export const getElectronicsProductHitValues = createHitExtractor<
  ElectronicsProductHitValues,
  ElectronicsHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/product/${objectID}`,
  imageFields: ['image'],
  derive: {
    condition: (hit, template) => resolveCondition(hit, template),
    warranty: (hit, template) =>
      getByPath<string>(hit, template.attributes.warranty) ||
      (resolveCondition(hit, template) === 'New'
        ? '1-year manufacturer warranty'
        : '90-day limited warranty'),
  },
})
