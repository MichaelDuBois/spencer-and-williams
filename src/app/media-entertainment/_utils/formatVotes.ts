/** TMDB's `vote_average` is a 0-10 float; one decimal is how it is read. */
export const formatRating = (
  rating: number | null | undefined,
): string | null =>
  typeof rating === 'number' && rating > 0 ? rating.toFixed(1) : null

/** Locale is pinned so the label is identical on the server and in tests. */
export const formatVoteCount = (
  count: number | null | undefined,
): string | null =>
  typeof count === 'number' && count > 0 ? count.toLocaleString('en-US') : null
