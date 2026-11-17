'use client'

import { useEffect, useState } from 'react'

import { getTimeUntilNextStagingSync } from '@/lib/staging-sync-schedule'

const TICK_MS = 30_000

export const useStagingSyncCountdown = (isActive: boolean): string => {
  const [label, setLabel] = useState(() =>
    getTimeUntilNextStagingSync(new Date()),
  )

  // A persistent countdown has to tick, or it silently goes stale on screen.
  useEffect(() => {
    if (!isActive) return

    const update = () => setLabel(getTimeUntilNextStagingSync(new Date()))
    update()
    const timer = setInterval(update, TICK_MS)
    return () => clearInterval(timer)
  }, [isActive])

  return label
}
