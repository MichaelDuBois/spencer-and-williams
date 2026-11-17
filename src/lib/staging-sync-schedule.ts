// Staging is refreshed on fixed UTC boundaries counted from midnight.
const SYNC_INTERVAL_HOURS = 3

export const getNextStagingSync = (now: Date): Date => {
  const elapsedWindows = Math.floor(now.getUTCHours() / SYNC_INTERVAL_HOURS)
  const next = new Date(now)
  next.setUTCMinutes(0, 0, 0)
  // setUTCHours(24) rolls into the next day on its own.
  next.setUTCHours((elapsedWindows + 1) * SYNC_INTERVAL_HOURS)
  return next
}

export const formatTimeUntil = (from: Date, to: Date): string => {
  const totalMinutes = Math.max(
    0,
    Math.ceil((to.getTime() - from.getTime()) / 60_000),
  )
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (!hours) return `${minutes}m`
  if (!minutes) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export const getTimeUntilNextStagingSync = (now: Date): string =>
  formatTimeUntil(now, getNextStagingSync(now))
