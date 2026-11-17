import type {
  FashionArticleHitValues,
  FashionProductHitValues,
} from '@/app/fashion/hitValues.types'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export type FashionHitTemplate = HitTemplate<FashionProductHitValues>

export type FashionArticleHitTemplate = HitTemplate<FashionArticleHitValues>

type BaseFashionConfigType = CreateConfigType<
  FashionHitTemplate,
  {
    querySuggestions: undefined
    aiSuggestions: undefined
    locations: undefined
    articles: FashionArticleHitTemplate
  }
>

export type FashionConfigType = Omit<BaseFashionConfigType, 'features'> & {
  features: BaseFashionConfigType['features'] & {
    showInlineArticles?: boolean
  }
}
