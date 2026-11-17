/**
 * TMDB serves every still image at a fixed set of derivative widths under
 * `/t/p/<size>/`. The vertical config pins `imageHrefPrefix` to the `w500`
 * derivative, which is right for poster rails but too soft for a 16:9 backdrop
 * or a full-bleed hero.
 *
 * Rather than add a second image field to the hit-values type (`AttributePathsFor`
 * uses `-?`, so every value field forces a matching required `config.ts` attribute
 * entry), this re-points an already-built URL at another derivative. `imageHrefPrefix`
 * stays the single source of truth for the host.
 */

/** The TMDB derivative widths this app asks for. */
export type TmdbImageSize =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w300'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'w1280'
  | 'original'

const TMDB_SIZE_SEGMENT = /(\/t\/p\/)[^/]+(?=\/)/

export const getTmdbImageUrl = (
  url: string | null | undefined,
  size: TmdbImageSize,
): string | undefined => {
  if (!url) return undefined

  // Not a TMDB derivative URL (another CDN, a local asset) — hand it back as-is.
  if (!TMDB_SIZE_SEGMENT.test(url)) return url

  return url.replace(TMDB_SIZE_SEGMENT, `$1${size}`)
}
