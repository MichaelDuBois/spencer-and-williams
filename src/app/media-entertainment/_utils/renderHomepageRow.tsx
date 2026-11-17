import { MediaEntertainmentBecauseYouWatchedRail } from '@/app/media-entertainment/_components/MediaEntertainmentBecauseYouWatchedRail'
import { MediaEntertainmentGenreRail } from '@/app/media-entertainment/_components/MediaEntertainmentGenreRail'
import { MediaEntertainmentRail } from '@/app/media-entertainment/_components/MediaEntertainmentRail'
import { MediaEntertainmentTop10Rail } from '@/app/media-entertainment/_components/MediaEntertainmentTop10Rail'
import {
  GENRE_ROW,
  RECOMMEND_ROW,
  type MediaHomepageRow,
} from '@/app/media-entertainment/_utils/buildHomepageRows'

/**
 * One row of the homepage, whatever kind it is. `index` is the row's own
 * position, so the entrance stagger stays contiguous across the two rows that
 * fetch on their own.
 */
export const renderHomepageRow = (row: MediaHomepageRow, index: number) => {
  if (row === RECOMMEND_ROW) {
    return <MediaEntertainmentBecauseYouWatchedRail key={row} index={index} />
  }

  if (row === GENRE_ROW) {
    return <MediaEntertainmentGenreRail key={row} index={index} />
  }

  return row.shape === 'top10' ? (
    <MediaEntertainmentTop10Rail key={row.id} rail={row} index={index} />
  ) : (
    <MediaEntertainmentRail key={row.id} rail={row} index={index} />
  )
}
