'use client'

import { useParams } from 'next/navigation'

import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { ProductLoadingState } from '@/components/product/ProductLoadingState'
import { useSetProductContext } from '@/features/aiAssistant/hooks/useSetProductContext'
import {
  productContextState,
  type ProductHitValues,
} from '@/features/aiAssistant/stores/aiAssistant'
import { useExtractedHit } from '@/hooks/useExtractedHit'
import type { UseGetRawHitOptions } from '@/hooks/useGetRawHit'
import type { RecordHit } from '@/types/recordHit.types'

interface ProductPageConfig<TTemplate> {
  slug: string
  algolia: {
    primaryIndex: {
      template?: TTemplate
    }
  }
}

interface ProductPageShellProps<
  TRaw extends RecordHit,
  TTemplate,
  TValues extends ProductHitValues,
> {
  config: ProductPageConfig<TTemplate>
  queryOptions?: UseGetRawHitOptions
  extractor: (raw: TRaw, template: TTemplate, slug: string) => TValues
  /** Label for the "back" link on the not-found state. Defaults to "Back to products". */
  notFoundBackLabel?: string
  children: (
    product: TValues,
    productTemplate: TTemplate | undefined,
  ) => React.ReactNode
}

export const ProductPageShell = <
  TRaw extends RecordHit,
  TTemplate,
  TValues extends ProductHitValues,
>({
  config,
  queryOptions,
  extractor,
  notFoundBackLabel = 'Back to products',
  children,
}: ProductPageShellProps<TRaw, TTemplate, TValues>) => {
  const params = useParams()
  const productId = params.id as string
  const { slug, algolia } = config
  const productTemplate = algolia.primaryIndex.template

  const {
    data: product,
    isLoading,
    isError,
  } = useExtractedHit<TRaw, TTemplate, TValues>(productId, {
    template: productTemplate,
    extractor,
    queryOptions,
  })

  useSetProductContext(productContextState, product)

  if (isLoading) {
    return <ProductLoadingState />
  }

  if (isError || !product) {
    return (
      <PdpNotFoundState
        title="Product not found"
        backHref={`/${slug}/search`}
        backLabel={notFoundBackLabel}
      />
    )
  }

  return <>{children(product, productTemplate)}</>
}
