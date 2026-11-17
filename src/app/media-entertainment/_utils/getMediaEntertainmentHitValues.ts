import { normalizeCast } from '@/app/media-entertainment/_utils/normalizeCast'
import { normalizeSeasons } from '@/app/media-entertainment/_utils/normalizeSeasons'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'
import type { MediaEntertainmentHitTemplate } from '@/app/media-entertainment/types'
import { createHitExtractor } from '@/utilities/createHitExtractor'
import { getByPath } from '@/utilities/getByPath'

export const getMediaEntertainmentHitValues = createHitExtractor<
  MediaEntertainmentTitleHitValues,
  MediaEntertainmentHitTemplate
>({
  productUrl: (slug, objectID) => `/${slug}/title/${objectID}`,
  imageFields: ['poster', 'backdrop'],
  derive: {
    // Cast is the one attribute that needs shaping rather than passing through:
    // its portraits are a nested path the generic image handling never sees.
    cast: (hit, template) => {
      const path = template.attributes.cast

      if (typeof path !== 'string') return undefined

      return normalizeCast(getByPath(hit, path), template.imageHrefPrefix)
    },
    // Same story as cast: season posters are nested, so they need shaping too.
    seasons: (hit, template) => {
      const path = template.attributes.seasons

      if (typeof path !== 'string') return undefined

      return normalizeSeasons(getByPath(hit, path), template.imageHrefPrefix)
    },
  },
})
