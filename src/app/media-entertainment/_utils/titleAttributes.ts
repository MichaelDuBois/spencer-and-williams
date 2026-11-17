import type { MediaEntertainmentHitTemplate } from '@/app/media-entertainment/types'

/** Flattens multi-path attributes and keeps two keys mapped to one attribute from being requested twice. */
const toAttributes = (paths: (string | readonly string[])[]): string[] => [
  ...new Set(paths.flat()),
]

/** Everything a poster, backdrop or Top 10 card renders — the lean browse set. */
export const getRailAttributes = (
  template: MediaEntertainmentHitTemplate,
): string[] => {
  const {
    title,
    type,
    genres,
    releaseYear,
    runtime,
    maturityRating,
    poster,
    backdrop,
    rating,
  } = template.attributes

  return toAttributes([
    'objectID', // derived rather than mapped, so it is requested by name
    title,
    type,
    genres,
    releaseYear,
    runtime,
    maturityRating,
    poster,
    backdrop,
    rating,
  ])
}

/**
 * The rail set plus the two series-length fields. The assistant reasons about
 * "a short series" and its cards sit next to films, so a show needs to be able
 * to label itself — rails get the season count from config-driven shapes
 * instead, which the assistant's groups do not have.
 */
export const getAssistantAttributes = (
  template: MediaEntertainmentHitTemplate,
): string[] => {
  const { seasonCount, episodeCount } = template.attributes

  return toAttributes([
    ...getRailAttributes(template),
    seasonCount,
    episodeCount,
  ])
}

export const getBillboardAttributes = (
  template: MediaEntertainmentHitTemplate,
): string[] => {
  const { tagline, overview } = template.attributes

  return toAttributes([...getRailAttributes(template), tagline, overview])
}

/** Everything the detail sheet renders — fetched for one record, on open. */
export const getDetailAttributes = (
  template: MediaEntertainmentHitTemplate,
): string[] => {
  const { cast, directors, ratingCount, seasonCount, episodeCount, seasons } =
    template.attributes

  return toAttributes([
    ...getBillboardAttributes(template),
    cast,
    directors,
    ratingCount,
    seasonCount,
    episodeCount,
    seasons,
  ])
}
