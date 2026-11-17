import { track, type ContentType } from '@/lib/analytics/track'

export interface ContentClickHit {
  objectID: string
  __queryID?: string
  __position?: number
}

interface ContentClickOptions {
  contentType: ContentType
  index: string
}

export const trackContentClick = (
  hit: ContentClickHit,
  { contentType, index }: ContentClickOptions,
): void => {
  track('content_clicked', {
    objectID: hit.objectID,
    contentType,
    index,
    ...(hit.__position !== undefined ? { position: hit.__position } : {}),
    ...(hit.__queryID ? { queryID: hit.__queryID } : {}),
  })
}
