import type { MediaEntertainmentSeason } from '@/app/media-entertainment/hitValues.types'
import { buildImageUrl } from '@/utilities/buildImageUrl'
import { getString } from '@/utilities/getString'
import { isRecord } from '@/utilities/isRecord'

/** Narrows TMDB's raw `seasons` array to the fields the rail renders. */
export const normalizeSeasons = (
  raw: unknown,
  imageHrefPrefix?: string,
): MediaEntertainmentSeason[] | undefined => {
  if (!Array.isArray(raw)) return undefined

  const seasons = raw
    .filter(isRecord)
    .flatMap<MediaEntertainmentSeason>((season) => {
      const seasonNumber = season.season_number

      // `Number.isFinite` alone does not narrow `unknown`, hence both checks.
      if (typeof seasonNumber !== 'number' || !Number.isFinite(seasonNumber)) {
        return []
      }

      const name = getString(season.name) ?? `Season ${seasonNumber}`
      const episodeCount = season.episode_count
      const posterPath = getString(season.poster_path)
      const poster = posterPath
        ? (buildImageUrl(posterPath, { prefix: imageHrefPrefix }) ?? undefined)
        : undefined

      return [
        {
          seasonNumber,
          name,
          ...(typeof episodeCount === 'number' && episodeCount > 0
            ? { episodeCount }
            : {}),
          ...(poster ? { poster } : {}),
        },
      ]
    })
    // Defensive: the index order is not guaranteed to be the airing order.
    .sort((first, second) => first.seasonNumber - second.seasonNumber)

  return seasons.length ? seasons : undefined
}
