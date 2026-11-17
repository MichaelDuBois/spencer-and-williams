import { Headphones } from 'lucide-react'

import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { TravelPodcastWaveform } from '@/app/travel/podcast/[id]/_components/TravelPodcastWaveform'
import {
  getTranscriptTurns,
  type TranscriptTurn,
} from '@/app/travel/podcast/[id]/_utils/transcriptHelpers'
import { buildTravelPodcastWaveformBars } from '@/app/travel/podcast/[id]/_utils/waveformLogic'
import { cn } from '@/lib/utils'

const TranscriptBubble = ({
  turn,
  showSpeaker,
}: {
  turn: TranscriptTurn
  showSpeaker: boolean
}) => (
  <article
    className={cn(
      'flex',
      turn.role === 'host' ? 'justify-end' : 'justify-start',
    )}>
    <div
      className={cn(
        'max-w-[70%] min-w-0',
        turn.role === 'host' && 'text-right',
      )}>
      {showSpeaker && (
        <p
          className={cn(
            'text-micro mb-2 font-semibold tracking-[0.24em] uppercase',
            turn.role === 'host' ? 'text-accent' : 'text-foreground/60',
          )}>
          {turn.speaker}
        </p>
      )}

      <div
        className={cn(
          'rounded-card border px-5 py-4 shadow-lg',
          turn.role === 'host' &&
            'border-accent/20 bg-accent text-accent-foreground shadow-accent/20 rounded-br-md',
          turn.role === 'guest' &&
            'border-border/70 bg-card/95 text-foreground shadow-primary/5 rounded-bl-md',
        )}>
        <p className="text-base leading-7 whitespace-pre-line md:text-lg md:leading-8">
          {turn.text}
        </p>
      </div>
    </div>
  </article>
)

export const TravelPodcastBody = ({
  podcast,
}: {
  podcast: PodcastHitValues
}) => {
  const transcriptTurns = getTranscriptTurns(podcast)
  const waveformBars = buildTravelPodcastWaveformBars(podcast)

  return (
    <section className="mx-auto mt-14 max-w-5xl">
      {transcriptTurns.length > 0 && (
        <>
          <TravelPodcastWaveform
            barHeights={waveformBars}
            podcastTitle={podcast.title}
            episodeTitle={podcast.episode}
            duration={podcast.duration}
          />

          <div className="mt-12">
            <div className="flex items-center gap-3">
              <div className="bg-accent/12 text-accent rounded-badge flex h-9 w-9 items-center justify-center">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase">
                  Transcript Extract
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5 md:space-y-6">
              {transcriptTurns.map((turn, index) => {
                const previousSpeaker = transcriptTurns[index - 1]?.speaker

                return (
                  <TranscriptBubble
                    key={`${podcast.objectID}-turn-${index}`}
                    turn={turn}
                    showSpeaker={previousSpeaker !== turn.speaker}
                  />
                )
              })}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
