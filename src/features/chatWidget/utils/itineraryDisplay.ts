import type {
  ItineraryActivity,
  ItineraryData,
  ItineraryDay,
} from '@/features/chatWidget/types/itinerary.types'
import { isPlainRecord } from '@/utilities/isPlainRecord'

/** Trimmed non-empty string, or undefined — stored values are always trimmed. */
const asTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Image URLs must match the shape travel records carry: an absolute http(s)
 * URL or a root-relative path. Absolute candidates are really parsed —
 * next/image's default loader runs `new URL(src)` on every src that isn't
 * root-relative, so a passing-but-unparseable string ("https://", a
 * mid-delta fragment) would crash the render. Root-relative paths never
 * reach that construction (they are encoded into `/_next/image?url=...`),
 * so they are accepted as-is. Protocol-relative "//" srcs are rejected
 * outright: next/image's loader (image-loader.js) throws on them before any
 * encoding, and `new URL('//x')` already throws here, so they can never be
 * safe.
 */
const asSafeImageUrl = (value: unknown): string | undefined => {
  const trimmed = asTrimmedString(value)
  if (!trimmed) return undefined

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed

  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? trimmed
      : undefined
  } catch {
    return undefined
  }
}

/** Domain counts must be whole and non-negative. */
const asNonNegativeInteger = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return undefined
  }
  return value
}

const sanitizeActivity = (value: unknown): ItineraryActivity | null => {
  if (!isPlainRecord(value)) return null

  const name = asTrimmedString(value.name)
  if (!name) return null

  const objectID = asTrimmedString(value.objectID)
  const parentID = asTrimmedString(value.parentID)
  const time = asTrimmedString(value.time)
  const image = asSafeImageUrl(value.image)
  const location = asTrimmedString(value.location)
  const description = asTrimmedString(value.description)

  return {
    ...(objectID && { objectID }),
    ...(parentID && { parentID }),
    name,
    ...(time && { time }),
    ...(image && { image }),
    ...(location && { location }),
    ...(description && { description }),
  }
}

const sanitizeDay = (value: unknown): ItineraryDay | null => {
  if (!isPlainRecord(value)) return null

  const day = asNonNegativeInteger(value.day)
  const title = asTrimmedString(value.title)
  // Day is 1-based per the Agent Studio tool schema, so a 0 frame is malformed.
  if (
    day === undefined ||
    day < 1 ||
    !title ||
    !Array.isArray(value.activities)
  ) {
    return null
  }

  const activities = value.activities
    .map(sanitizeActivity)
    .filter((activity): activity is ItineraryActivity => activity !== null)
  if (activities.length === 0) return null

  return { day, title, activities }
}

/**
 * Validates `displayItinerary` tool arguments at the render boundary.
 * Malformed or partial input degrades gracefully instead of crashing the chat:
 * invalid optional fields are dropped, invalid activities and days are
 * skipped, and a missing `destination` falls back at render time — input
 * without any renderable day yields `null` (the widget renders nothing for
 * that tool call).
 */
export const sanitizeItineraryData = (value: unknown): ItineraryData | null => {
  if (!isPlainRecord(value)) return null

  if (!Array.isArray(value.days)) return null

  const days = value.days
    .map(sanitizeDay)
    .filter((day): day is ItineraryDay => day !== null)
  if (days.length === 0) return null

  const destination = asTrimmedString(value.destination)
  const title = asTrimmedString(value.title)
  const durationNights = asNonNegativeInteger(value.durationNights)
  const notes = asTrimmedString(value.notes)

  return {
    ...(destination && { destination }),
    ...(title && { title }),
    ...(durationNights !== undefined && { durationNights }),
    days,
    ...(notes && { notes }),
  }
}
