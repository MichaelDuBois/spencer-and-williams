import type { PodcastHitValues } from '@/app/travel/hitValues.types'

const MIN_BAR_HEIGHT = 0.18
const MAX_BAR_HEIGHT = 0.96
const BASE_BAR_RATIO = 0.3
const MAX_ADJACENT_BAR_DELTA = 0.3

const normalizeTranscriptText = ({
  transcript,
}: Pick<PodcastHitValues, 'transcript'>) =>
  (transcript ?? [])
    .map(({ text }) => text)
    .join(' ')
    .trim()

const getAlphabetPosition = (character: string) => {
  const characterCode = character.toLowerCase().charCodeAt(0)

  if (characterCode < 97 || characterCode > 122) {
    return 0
  }

  return characterCode - 96
}

const getBaseBarHeight = () =>
  MIN_BAR_HEIGHT + BASE_BAR_RATIO * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)

const getBarHeightFromCharacter = (character?: string) => {
  const alphabetPosition = character ? getAlphabetPosition(character) : 0

  if (alphabetPosition === 0) {
    return getBaseBarHeight()
  }

  return (
    MIN_BAR_HEIGHT +
    (BASE_BAR_RATIO + ((alphabetPosition - 1) / 25) * (1 - BASE_BAR_RATIO)) *
      (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)
  )
}

export const buildTravelPodcastWaveformBars = (
  podcast: Pick<PodcastHitValues, 'transcript'>,
  barCount = 100,
) => {
  if (barCount <= 0) {
    return []
  }

  const transcriptText = normalizeTranscriptText(podcast).slice(0, barCount)

  return Array.from({ length: barCount }).reduce<number[]>((bars, _, index) => {
    const rawHeight = getBarHeightFromCharacter(transcriptText[index])

    if (index === 0) {
      bars.push(Number(rawHeight.toFixed(3)))
      return bars
    }

    const previousHeight = bars[index - 1]
    const smoothedHeight = Math.min(
      previousHeight + MAX_ADJACENT_BAR_DELTA,
      Math.max(previousHeight - MAX_ADJACENT_BAR_DELTA, rawHeight),
    )

    bars.push(Number(smoothedHeight.toFixed(3)))
    return bars
  }, [])
}
