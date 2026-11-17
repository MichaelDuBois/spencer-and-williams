import type {
  ActivityHitValues,
  ArticleHitValues,
  PodcastHitValues,
} from '@/app/travel/hitValues.types'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export type TravelArticleHitTemplate = HitTemplate<ArticleHitValues>
export type TravelPodcastHitTemplate = HitTemplate<PodcastHitValues>
export type TravelActivityHitTemplate = HitTemplate<ActivityHitValues>

export type TravelMediaConfigType = CreateConfigType<
  TravelArticleHitTemplate,
  {
    podcasts: TravelPodcastHitTemplate
    activities: TravelActivityHitTemplate
    aiSuggestions: undefined
  }
>
