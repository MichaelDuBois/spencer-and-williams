export type DerivedFieldName = 'objectID' | 'productUrl'

export type AttributePathsFor<TValues> = {
  [K in keyof Omit<TValues, DerivedFieldName>]-?: TValues[K] extends
    | readonly string[]
    | undefined
    ? string | readonly string[]
    : string
}

export interface HitTemplate<TValues> {
  attributes: AttributePathsFor<TValues>
  imageHrefPrefix?: string
}

export type HitExtractor<TValues, TTemplate> = (
  item: Record<string, unknown>,
  template: TTemplate,
  slug: string,
) => TValues
