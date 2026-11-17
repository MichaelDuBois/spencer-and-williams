import type {
  ActivityHitValues,
  ArticleHitValues,
  PodcastHitValues,
} from '@/app/travel/hitValues.types'
import type {
  TravelActivityHitTemplate,
  TravelArticleHitTemplate,
  TravelPodcastHitTemplate,
} from '@/app/travel/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'
import { getByPath } from '@/utilities/getByPath'

export const getArticleHitValues = createHitExtractor<
  ArticleHitValues,
  TravelArticleHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/article/${objectID}`,
  imageFields: ['image'],
  derive: {
    location: (hit, template) => {
      const value = getByPath<{ country?: string; region?: string } | string>(
        hit,
        template.attributes.location,
      )
      if (typeof value === 'string') return value || undefined
      if (value && (value.country || value.region)) {
        return [value.country, value.region].filter(Boolean).join(', ')
      }
      return undefined
    },
  },
})

export const getPodcastHitValues = createHitExtractor<
  PodcastHitValues,
  TravelPodcastHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/podcast/${objectID}`,
  imageFields: ['image'],
})

export const getActivityHitValues = createHitExtractor<
  ActivityHitValues,
  TravelActivityHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/activity/${objectID}`,
  imageFields: ['image'],
})
