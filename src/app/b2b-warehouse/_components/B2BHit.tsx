'use client'

import { B2BProductPrice } from '@/app/b2b-warehouse/_components/B2BProductPrice'
import { useB2BPrepareCartProduct } from '@/app/b2b-warehouse/_hooks/useB2BPrepareCartProduct'
import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import type { B2BWarehouseHitTemplate } from '@/app/b2b-warehouse/types'
import { Hit } from '@/components/hit/Hit'
import type { HitProps } from '@/components/hit/hit.types'
import { SkuLabel } from '@/components/product/SkuLabel'

export const B2BHit = (
  props: Omit<
    HitProps<B2BWarehouseProductHitValues, B2BWarehouseHitTemplate>,
    'priceComponent' | 'prepareCartProduct' | 'renderDetails'
  >,
) => {
  const prepareCartProduct = useB2BPrepareCartProduct()
  const skuAttribute = props.template?.attributes.sku
  return (
    <Hit
      {...props}
      priceComponent={B2BProductPrice}
      prepareCartProduct={prepareCartProduct}
      renderDetails={(product, renderHighlight) =>
        product.sku &&
        skuAttribute && <SkuLabel>{renderHighlight(skuAttribute)}</SkuLabel>
      }
    />
  )
}
