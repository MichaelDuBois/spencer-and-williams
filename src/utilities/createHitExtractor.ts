import type { DerivedFieldName, HitTemplate } from '@/types/hitTemplate.types'
import { buildImageUrl } from '@/utilities/buildImageUrl'
import { getByPath } from '@/utilities/getByPath'

type ExtractedFieldName<TValues> = keyof Omit<TValues, DerivedFieldName> &
  string

type StringFieldName<TValues> = {
  [K in ExtractedFieldName<TValues>]: TValues[K] extends string | undefined
    ? K
    : never
}[ExtractedFieldName<TValues>]

type DeriveCallbacks<TValues, TTemplate> = {
  [K in ExtractedFieldName<TValues>]?: (
    hit: Record<string, unknown>,
    template: TTemplate,
    slug: string,
  ) => TValues[K] | undefined
}

export interface HitExtractorOptions<TValues, TTemplate> {
  /** Receives a URL-encoded objectID; extracted values retain the raw ID. */
  productUrl: (slug: string, objectID: string) => string
  imageFields?: ReadonlyArray<StringFieldName<TValues>>
  derive?: DeriveCallbacks<TValues, TTemplate>
}

export const createHitExtractor =
  <
    TValues extends { objectID: string; productUrl: string },
    TTemplate extends HitTemplate<TValues>,
  >(
    options: HitExtractorOptions<TValues, TTemplate>,
  ) =>
  (hit: object, template: TTemplate, slug: string): TValues => {
    const hitRecord = hit as Record<string, unknown>
    const objectID = String(hitRecord.objectID ?? '')
    const extractedValues: Record<string, unknown> = {
      objectID,
      productUrl: options.productUrl(slug, encodeURIComponent(objectID)),
    }

    const imageFieldNames = new Set<string>(options.imageFields ?? [])
    const imageHrefPrefix = template.imageHrefPrefix

    for (const [fieldName, deriveFn] of Object.entries(options.derive ?? {})) {
      if (typeof deriveFn === 'function') {
        extractedValues[fieldName] = deriveFn(hitRecord, template, slug)
      }
    }

    for (const [fieldName, attributePath] of Object.entries(
      template.attributes,
    )) {
      if (fieldName in extractedValues) continue

      if (Array.isArray(attributePath)) {
        const levels = attributePath
          .map((path) => getByPath(hitRecord, path))
          .filter(
            (value): value is string =>
              typeof value === 'string' && value !== '',
          )
        if (levels.length > 0) extractedValues[fieldName] = levels
        continue
      }

      if (typeof attributePath !== 'string') continue

      const rawValue = getByPath(hitRecord, attributePath)
      if (rawValue == null || rawValue === '') continue

      if (imageFieldNames.has(fieldName)) {
        extractedValues[fieldName] =
          buildImageUrl(rawValue as string, { prefix: imageHrefPrefix }) ??
          undefined
        continue
      }

      extractedValues[fieldName] = rawValue
    }

    for (const fieldName of Object.keys(template.attributes)) {
      if (!(fieldName in extractedValues)) {
        extractedValues[fieldName] = undefined
      }
    }

    return extractedValues as TValues
  }
