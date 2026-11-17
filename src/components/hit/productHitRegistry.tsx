'use client'

import { B2BHit } from '@/app/b2b-warehouse/_components/B2BHit'
import { B2BProductPrice } from '@/app/b2b-warehouse/_components/B2BProductPrice'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import type { B2BWarehouseHitTemplate } from '@/app/b2b-warehouse/types'
import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { getElectronicsProductHitValues } from '@/app/electronics/_utils/getElectronicsProductHitValues'
import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { getFurnishingProductHitValues } from '@/app/furnishing/_utils/getFurnishingProductHitValues'
import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { ProductAutocompleteHit } from '@/components/autocomplete/hits'
import type { CarouselSectionVariant } from '@/components/CarouselSection'
import { Hit } from '@/components/hit/Hit'
import type { HitProductValues, Variant } from '@/components/hit/hit.types'
import type { HitExtractor, HitTemplate } from '@/types/hitTemplate.types'

import type { RecommendHit } from 'algoliasearch/lite'
import type { ReactElement } from 'react'

export type ProductVerticalSlug =
  | 'b2b-warehouse'
  | 'ecommerce'
  | 'electronics'
  | 'fashion'
  | 'furnishing'
  | 'grocery'

type ProductTemplate = HitTemplate<{ name: string }> & {
  attributes: HitTemplate<{ name: string }>['attributes'] & {
    sku?: string
  }
}
type RegisteredExtractor = HitExtractor<HitProductValues, never>

interface RegisteredProductHitProps {
  hit: RecommendHit
  slug: string
  template: ProductTemplate | undefined
}

interface RegisteredAutocompleteHitProps {
  item: Record<string, unknown>
  slug: string
  template: ProductTemplate
  onSelect: () => void
  skuAttribute?: string
}

export interface ProductHitDefinition {
  extractor: RegisteredExtractor
  variant: Variant
  carouselVariant: CarouselSectionVariant
  usesScopedQueryOptions?: boolean
  renderHit: (props: RegisteredProductHitProps) => ReactElement
  renderAutocompleteHit: (props: RegisteredAutocompleteHitProps) => ReactElement
}

const createProductHitDefinition = <
  TValues extends HitProductValues,
  TTemplate extends ProductTemplate,
>({
  extractor,
  variant,
  carouselVariant = variant,
}: {
  extractor: HitExtractor<TValues, TTemplate>
  variant: Exclude<Variant, 'b2b-warehouse'>
  carouselVariant?: CarouselSectionVariant
}): ProductHitDefinition => {
  return {
    extractor,
    variant,
    carouselVariant,
    renderHit: ({ hit, slug, template }) => (
      <Hit
        variant={variant}
        item={hit}
        template={template as TTemplate | undefined}
        slug={slug}
        extractor={extractor}
      />
    ),
    renderAutocompleteHit: ({
      item,
      slug,
      template,
      onSelect,
      skuAttribute,
    }) => (
      <ProductAutocompleteHit
        item={item}
        template={template as TTemplate}
        slug={slug}
        extractor={extractor}
        onSelect={onSelect}
        nameClassName={slug === 'fashion' ? 'font-secondary' : undefined}
        skuAttribute={skuAttribute}
      />
    ),
  }
}

export const PRODUCT_HIT_REGISTRY = {
  'b2b-warehouse': {
    extractor: getB2BWarehouseProductHitValues,
    variant: 'b2b-warehouse',
    carouselVariant: 'standard',
    usesScopedQueryOptions: true,
    renderHit: ({ hit, slug, template }) => (
      <B2BHit
        variant="b2b-warehouse"
        item={hit}
        template={template as B2BWarehouseHitTemplate}
        slug={slug}
        extractor={getB2BWarehouseProductHitValues}
      />
    ),
    renderAutocompleteHit: ({
      item,
      slug,
      template,
      onSelect,
      skuAttribute,
    }) => (
      <ProductAutocompleteHit
        item={item}
        template={template as B2BWarehouseHitTemplate}
        slug={slug}
        extractor={getB2BWarehouseProductHitValues}
        priceComponent={B2BProductPrice}
        onSelect={onSelect}
        skuAttribute={skuAttribute}
      />
    ),
  },
  ecommerce: createProductHitDefinition({
    extractor: getEcommerceProductHitValues,
    variant: 'standard',
  }),
  electronics: createProductHitDefinition({
    extractor: getElectronicsProductHitValues,
    variant: 'standard',
  }),
  fashion: createProductHitDefinition({
    extractor: getFashionProductHitValues,
    variant: 'editorial',
  }),
  furnishing: createProductHitDefinition({
    extractor: getFurnishingProductHitValues,
    variant: 'standard',
  }),
  grocery: createProductHitDefinition({
    extractor: getGroceryProductHitValues,
    variant: 'grocery',
  }),
} satisfies Record<ProductVerticalSlug, ProductHitDefinition>

export const getProductHitDefinition = (
  slug: string | undefined,
): ProductHitDefinition | undefined => {
  if (!slug || !isProductVerticalSlug(slug)) return undefined
  return PRODUCT_HIT_REGISTRY[slug]
}

const isProductVerticalSlug = (slug: string): slug is ProductVerticalSlug =>
  Object.hasOwn(PRODUCT_HIT_REGISTRY, slug)
