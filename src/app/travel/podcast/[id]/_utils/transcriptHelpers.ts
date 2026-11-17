import type { PodcastHitValues } from '@/app/travel/hitValues.types'

export type SpeakerRole = 'host' | 'guest'

export type TranscriptTurn = { speaker: string; text: string } & {
  role: SpeakerRole
}

const normalizeSpeakerName = (name: string) =>
  name.trim().replace(/\s+/g, ' ').toLowerCase()

export const getTranscriptTurns = ({
  transcript,
  hosts,
}: Pick<PodcastHitValues, 'transcript' | 'hosts'>): TranscriptTurn[] =>
  (transcript ?? []).map((turn) => {
    return {
      ...turn,
      role: (hosts ?? []).some(
        (name) =>
          normalizeSpeakerName(name) === normalizeSpeakerName(turn.speaker),
      )
        ? 'host'
        : 'guest',
    }
  })

export const getOrderedSpeakerNames = ({
  hosts,
  guests,
}: Pick<PodcastHitValues, 'hosts' | 'guests'>) => {
  const seenSpeakers = new Set<string>()

  return [...(hosts ?? []), ...(guests ?? [])].filter((name) => {
    const normalizedName = normalizeSpeakerName(name)

    if (!normalizedName || seenSpeakers.has(normalizedName)) {
      return false
    }

    seenSpeakers.add(normalizedName)
    return true
  })
}
