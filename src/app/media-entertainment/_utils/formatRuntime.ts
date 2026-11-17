/**
 * Formats a TMDB `runtime` (whole minutes) as `2h 22m` / `45m` / `2h`.
 *
 * Returns `null` — never `"0m"` — for a missing or zero runtime. Roughly 234k
 * records in `media_ns` carry `runtime: 0` (series mostly, but plenty of films
 * too), so callers must treat the absent case as "no runtime to show" and
 * substitute their own label ("Series") rather than render a zero.
 */
export const formatRuntime = (
  runtime: number | null | undefined,
): string | null => {
  if (!runtime || runtime <= 0) return null

  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60

  if (!hours) return `${minutes}m`
  if (!minutes) return `${hours}h`

  return `${hours}h ${minutes}m`
}
