'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatPlaybackTimestamp } from '@/app/travel/podcast/[id]/_utils/formatPlaybackTimestamp'
import { Button } from '@/components/ui/button/Button'
import { cn } from '@/lib/utils'

const WaveformLayer = ({
  barHeights,
  className,
  barClassName,
}: {
  barHeights: number[]
  className?: string
  barClassName?: string
}) => (
  <div className={cn('flex h-full items-center gap-px md:gap-0.5', className)}>
    {barHeights.map((barHeight, index) => (
      <div
        key={`waveform-bar-${index}`}
        className="flex h-full min-w-0 flex-1 items-center">
        <div
          className={cn('w-full rounded-full transition-colors', barClassName)}
          style={{ height: `${Math.round(barHeight * 100)}%` }}
        />
      </div>
    ))}
  </div>
)

export const TravelPodcastWaveform = ({
  barHeights,
  podcastTitle,
  episodeTitle,
  duration,
}: {
  barHeights: number[]
  podcastTitle: string
  episodeTitle?: string
  duration?: number
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [elapsedPlaybackMs, setElapsedPlaybackMs] = useState(0)
  const playbackDurationMs = Math.max(0, duration ?? 0) * 60 * 1000
  const playbackPercent = Math.max(0, Math.min(100, playbackProgress * 100))

  useEffect(() => {
    if (!isPlaying || playbackDurationMs === 0) {
      return
    }

    const playbackStartedAt = Date.now()
    const syncPlayback = () => {
      const elapsed = Math.min(
        Date.now() - playbackStartedAt,
        playbackDurationMs,
      )

      setElapsedPlaybackMs(elapsed)
      setPlaybackProgress(elapsed / playbackDurationMs)

      if (elapsed >= playbackDurationMs) {
        setIsPlaying(false)
      }
    }

    syncPlayback()
    const intervalId = window.setInterval(syncPlayback, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isPlaying, playbackDurationMs])

  if (barHeights.length === 0) {
    return null
  }

  const handlePreviewToggle = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setPlaybackProgress(0)
      setElapsedPlaybackMs(0)
      return
    }

    if (playbackDurationMs === 0) {
      return
    }

    setPlaybackProgress(0)
    setElapsedPlaybackMs(0)
    setIsPlaying(true)
  }

  return (
    <section className="border-border bg-card shadow-accent/10 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-2xl border px-4 py-4 shadow-xl md:gap-x-5 md:px-5">
      <Button
        type="button"
        aria-label={
          isPlaying ? 'Stop waveform preview' : 'Play waveform preview'
        }
        aria-pressed={isPlaying}
        className="shadow-accent/20 row-start-2 h-14 w-14 self-center rounded-full p-0 shadow-lg md:h-16 md:w-16 [&_svg]:size-5"
        onClick={handlePreviewToggle}>
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 translate-x-[1px]" />
        )}
      </Button>

      <div className="col-start-2 row-start-1 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-micro line-clamp-1 font-semibold tracking-[0.18em] uppercase">
            {podcastTitle}
          </p>
          {episodeTitle && (
            <p className="text-foreground/70 mt-1 line-clamp-1 text-sm font-medium">
              {episodeTitle}
            </p>
          )}
        </div>
        <div className="text-muted-foreground mb-[1px] text-[0.72rem] font-medium tabular-nums">
          {formatPlaybackTimestamp(elapsedPlaybackMs)} /{' '}
          {formatPlaybackTimestamp(playbackDurationMs)}
        </div>
      </div>

      <div className="relative row-start-2 h-18 overflow-hidden md:h-20">
        <div className="absolute inset-0">
          <WaveformLayer
            barHeights={barHeights}
            className="relative z-10 h-full"
            barClassName={cn(
              'bg-foreground/14',
              isPlaying && 'bg-foreground/18',
            )}
          />

          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              clipPath: `inset(0 ${Math.max(0, 100 - playbackPercent)}% 0 0)`,
              transition: isPlaying ? 'clip-path 250ms linear' : 'none',
            }}>
            <WaveformLayer
              barHeights={barHeights}
              className="h-full"
              barClassName="bg-accent/90"
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 inset-y-2 z-30">
            <div
              className="absolute inset-y-0"
              style={{ left: `${playbackPercent}%` }}>
              <div className="bg-accent/70 absolute inset-y-0 left-1/2 w-px -translate-x-1/2" />
              <div
                className={cn(
                  'bg-accent border-secondary absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-[0_0_0_3px_rgba(210,140,98,0.14)]',
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
