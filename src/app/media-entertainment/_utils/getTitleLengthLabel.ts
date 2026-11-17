import { formatRuntime } from '@/app/media-entertainment/_utils/formatRuntime'
import { pluralize } from '@/app/media-entertainment/_utils/pluralize'
import type { MediaEntertainmentTitleHitValues } from '@/app/media-entertainment/hitValues.types'

type TitleLengthFields = Pick<
  MediaEntertainmentTitleHitValues,
  'runtime' | 'type' | 'seasonCount'
>

/**
 * The single "how long is it" label: a runtime for a film, a season count for a
 * series, and the bare word "Series" when a show has neither — roughly 234k
 * records carry `runtime: 0`, and rails do not request the season count.
 */
export const getTitleLengthLabel = (
  title: TitleLengthFields,
): string | null => {
  const runtime = formatRuntime(title.runtime)

  if (runtime) return runtime
  if (title.type !== 'show') return null

  const seasons = title.seasonCount

  if (!seasons || seasons <= 0) return 'Series'

  return pluralize(seasons, 'Season')
}
