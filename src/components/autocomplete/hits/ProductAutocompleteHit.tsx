'use client'

import { ArrowRight } from 'lucide-react'
import { Highlight } from 'react-instantsearch'

import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import { Image } from '@/components/image/Image'
import { SkuLabel } from '@/components/product/SkuLabel'
import { useInsightsEvents } from '@/hooks/useInsightsEvents'
import { useRankingBadges } from '@/hooks/useRankingBadges'
import { cn } from '@/lib/utils'
import type { HitExtractor, HitTemplate } from '@/types/hitTemplate.types'
import type { ProductPriceProps } from '@/types/productPricing.types'

import type { Hit } from 'instantsearch.js'
import type { ComponentType } from 'react'

export interface ProductAutocompleteValues
  extends EcommerceProductHitValues, B2BWarehouseProductHitValues {}

interface ProductAutocompleteHitProps<
  TValues extends ProductAutocompleteValues,
  TTemplate extends HitTemplate<{ name: string }>,
> {
  item: Record<string, unknown>
  template: TTemplate
  slug: string
  extractor: HitExtractor<TValues, TTemplate>
  priceComponent?: ComponentType<ProductPriceProps>
  onSelect: () => void
  nameClassName?: string
  skuAttribute?: string
}

export const ProductAutocompleteHit = <
  TValues extends ProductAutocompleteValues,
  TTemplate extends HitTemplate<{ name: string }>,
>({
  item,
  template,
  slug,
  extractor,
  priceComponent: PriceComponent,
  onSelect,
  nameClassName,
  skuAttribute,
}: ProductAutocompleteHitProps<TValues, TTemplate>) => {
  const values = extractor(item, template, slug)
  const { sendProductClickEvent } = useInsightsEvents()
  const { isComposed, isPersonalized, composedLabel } = useRankingBadges(item)

  const handleClick = () => {
    sendProductClickEvent(
      {
        objectID: item.objectID as string,
        __queryID: item.__queryID as string | undefined,
        __position: item.__position as number | undefined,
      },
      { surface: 'autocomplete' },
    )
    onSelect()
  }

  return (
    <div
      role="button"
      className={cn(
        'group hover:bg-muted flex cursor-pointer items-center gap-4 px-3 py-2.5 transition-all duration-200',
        isComposed && 'bg-accent/5',
      )}
      onClick={handleClick}>
      <Image
        src={values.image}
        alt=""
        width={48}
        height={48}
        className="rounded-image h-12 w-12 shrink-0 object-contain"
        fallbackClassName="rounded-image h-12 w-12 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-foreground line-clamp-1 text-sm font-medium',
            nameClassName,
          )}>
          <Highlight
            hit={item as Hit<Record<string, unknown>>}
            attribute={template.attributes.name}
          />
        </div>
        {skuAttribute && values.sku && (
          <SkuLabel>
            <Highlight
              hit={item as Hit<Record<string, unknown>>}
              attribute={skuAttribute}
            />
          </SkuLabel>
        )}
        <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
          {values.brand && (
            <span className="text-[0.65rem] tracking-widest uppercase">
              {values.brand}
            </span>
          )}
          {values.brand && values.category && <span>•</span>}
          {values.category && <span>{values.category}</span>}
          {isComposed && (
            <>
              <span>•</span>
              <span className="text-accent">{composedLabel}</span>
            </>
          )}
          {isPersonalized && (
            <>
              <span>•</span>
              <span className="text-accent">For You</span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {values.price !== undefined ? (
          PriceComponent ? (
            <PriceComponent
              price={values.price}
              className="text-foreground text-sm font-semibold"
            />
          ) : (
            <div className="text-foreground text-sm font-semibold">
              ${values.price}
            </div>
          )
        ) : null}
        <ArrowRight className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </div>
  )
}
