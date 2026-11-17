import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import type {
  B2BContentContext,
  ProductHitValues,
  TravelContentContext,
} from '@/features/aiAssistant/stores/aiAssistant'

interface BuildPageContextArgs {
  productContext: ProductHitValues | null
  travelContentContext: TravelContentContext | null
  b2bContentContext: B2BContentContext | null
  fashionContentContext: FashionArticleHitValues | null
}

/** Builds the page record note shared by both assistant implementations. */
export const buildPageContext = ({
  productContext,
  travelContentContext,
  b2bContentContext,
  fashionContentContext,
}: BuildPageContextArgs): string | null => {
  const pageContext = productContext
    ? {
        data: productContext,
        label: 'product page',
        dataLabel: 'product data',
      }
    : travelContentContext?.record
      ? {
          data: travelContentContext.record,
          label: `${travelContentContext.contentType ?? 'travel content'} page`,
          dataLabel: `${travelContentContext.contentType ?? 'travel content'} data`,
        }
      : b2bContentContext?.record
        ? {
            data: b2bContentContext.record,
            label: 'content page',
            dataLabel: 'content data',
          }
        : fashionContentContext
          ? {
              data: fashionContentContext,
              label: 'article page',
              dataLabel: 'article data',
            }
          : null

  if (!pageContext) return null

  const { data, label, dataLabel } = pageContext
  return `[Context: The user is currently viewing this ${label}. Don't call search tool here, unless necessary. Here is the full ${dataLabel}: ${JSON.stringify(data)}]`
}
