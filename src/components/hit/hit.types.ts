import type { ColorSwatch } from '@/components/product/ColorSelector'
import type { PrepareCartProduct } from '@/hooks/useAddToCart'
import type { HitExtractor, HitTemplate } from '@/types/hitTemplate.types'
import type { ProductPriceProps } from '@/types/productPricing.types'

import type { ComponentType, ReactNode } from 'react'

export type Variant = 'standard' | 'editorial' | 'grocery' | 'b2b-warehouse'

/** A PDP colour swatch plus what a hit card swaps in when it is hovered. */
export interface HitColorVariant extends ColorSwatch {
  image?: string
  price?: number
}

export interface HitProductValues {
  objectID: string
  productUrl: string
  name: string
  image?: string
  brand?: string
  category?: string
  price?: number
  colorVariants?: HitColorVariant[]
  nutrition?: {
    servingSize?: string
  }
}

export interface HitProps<
  TValues extends HitProductValues,
  TTemplate extends HitTemplate<{ name: string }>,
> {
  variant: Variant
  item: Record<string, unknown>
  template: TTemplate | undefined
  slug: string
  extractor: HitExtractor<TValues, TTemplate>
  prepareCartProduct?: PrepareCartProduct
  priceComponent?: ComponentType<ProductPriceProps>
  disableHighlight?: boolean
  /** Override when the grid is denser or narrower than the default 3-4 columns. */
  imageSizes?: string
  renderDetails?: (
    values: TValues,
    renderHighlight: (attribute: string) => ReactNode,
  ) => ReactNode
}

export interface HitImageProps {
  image: string | undefined
  name: string
  containerClassName: string
  imageClassName: string
  sizes?: string
}

interface AddToCartConfig {
  compact?: boolean
  label?: string
  showIcon?: boolean
  animated?: boolean
  className?: string
}

export interface VariantClasses {
  actionContainer: string
  article: string
  composedArticle: string
  sponsoredArticle?: string
  composedImageContainer?: string
  imageContainer: string
  image: string
  contentContainer: string
  brand: string
  name: string
  price: string
  category?: string
  rating?: string
  footer?: string
  forYouBadge?: string
  addToCartConfig?: AddToCartConfig
  servingSize?: string
  variantRow?: string
}
