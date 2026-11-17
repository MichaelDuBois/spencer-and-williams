import { humanizeSlug } from '@/app/grocery/_utils/humanizeSlug'
import { parseSemanticAttributes } from '@/app/grocery/_utils/parseSemanticAttributes'
import type { GroceryProductHitValues } from '@/app/grocery/hitValues.types'
import type { GroceryHitTemplate } from '@/app/grocery/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'

export const getGroceryProductHitValues = createHitExtractor<
  GroceryProductHitValues,
  GroceryHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/product/${objectID}`,
  imageFields: ['image'],
  derive: {
    // `category` is the underscored product `type` (e.g. `ditalini_pasta`);
    // humanize it for display. The raw `type` field is preserved for exact
    // recipe-ingredient matching.
    category: (hit) =>
      typeof hit.type === 'string' ? humanizeSlug(hit.type) : undefined,
    semanticAttributes: (hit) =>
      parseSemanticAttributes(hit.semantic_attributes),
  },
})
