import type { MediaEntertainmentCastMember } from '@/app/media-entertainment/hitValues.types'
import { buildImageUrl } from '@/utilities/buildImageUrl'
import { getString } from '@/utilities/getString'
import { isRecord } from '@/utilities/isRecord'

/**
 * Narrows TMDB's raw `cast` array to the three fields the UI renders and resolves
 * `profile_path` against the config's image prefix — the extractor only prefixes
 * top-level image fields, never ones nested in an object array.
 */
export const normalizeCast = (
  raw: unknown,
  imageHrefPrefix?: string,
): MediaEntertainmentCastMember[] | undefined => {
  if (!Array.isArray(raw)) return undefined

  const cast = raw
    .filter(isRecord)
    .flatMap<MediaEntertainmentCastMember>((member) => {
      const name = getString(member.name)
      if (!name) return []

      const character = getString(member.character)
      const profilePath = getString(member.profile_path)
      const profileImage = profilePath
        ? (buildImageUrl(profilePath, { prefix: imageHrefPrefix }) ?? undefined)
        : undefined

      return [
        {
          name,
          ...(character ? { character } : {}),
          ...(profileImage ? { profileImage } : {}),
        },
      ]
    })

  return cast.length ? cast : undefined
}
