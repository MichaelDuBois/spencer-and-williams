import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type {
  MediaEntertainmentTitleHitValues,
  MediaTitleHit,
} from '@/app/media-entertainment/hitValues.types'
import { createSessionJSONStorage } from '@/stores/sessionJSONStorage'

/**
 * The title whose detail sheet is open, or `null` when it is closed. It holds the
 * card's own values rather than an objectID so the sheet can paint artwork and
 * heading on the click, before the full record lands — and the card's `__queryID`
 * with them, so an action taken in the sheet still attributes to the query that
 * surfaced the title.
 */
export const selectedMediaTitleAtom = atom<MediaTitleHit | null>(null)

/**
 * Hit values for titles this session has already rendered, keyed by objectID.
 *
 * In-memory only, and deliberately not persisted: it exists so a title added to
 * My List paints into the rail on the click, with no round trip and no spinner,
 * while the persisted state still stores nothing but objectIDs. A reload empties
 * it and the rails rehydrate from the index, so a reindex can never surface a
 * stale record.
 */
export const mediaTitleRecordsAtom = atom<
  Record<string, MediaEntertainmentTitleHitValues>
>({})

/** Which profile the viewer picked, and how — `null` until they pick one. */
export type MediaProfileChoice =
  | { kind: 'persona'; personaId: string }
  | { kind: 'realtime' }
  | { kind: 'anonymous' }

const profileStorage = createSessionJSONStorage<MediaProfileChoice | null>()

/**
 * Persisted so a reload does not silently drop the viewer back to the anonymous
 * bucket, which would empty both rails mid-demo. sessionStorage, matching the
 * watch state it keys: a new tab starts at "Who's watching?" again.
 *
 * The persona *object* is not stored — only its id, resolved against config on
 * restore, so a renamed or removed persona cannot come back from storage.
 */
export const mediaProfileChoiceAtom =
  atomWithStorage<MediaProfileChoice | null>(
    'spencer-williams-media-entertainment-profile',
    null,
    profileStorage,
    { getOnInit: true },
  )

/** Reopens the picker from the header, once a choice has already been made. */
export const mediaProfilePickerOpenAtom = atom(false)
