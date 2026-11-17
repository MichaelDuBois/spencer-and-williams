import { vi } from 'vitest'

type ChangeListener = (event: { matches: boolean }) => void

/**
 * jsdom has no `window.matchMedia`, so every hook built on it needs a stub.
 * Returns the live listener set plus an `emit` that flips the match state and
 * notifies subscribers, the way a real `change` event would.
 *
 * Call `vi.unstubAllGlobals()` in an `afterEach` to remove it.
 */
export const installMatchMedia = (initialMatches: boolean) => {
  let matches = initialMatches
  const listeners = new Set<ChangeListener>()

  const matchMedia = vi.fn((query: string) => {
    return {
      query,
      get matches() {
        return matches
      },
      addEventListener: (_: string, cb: ChangeListener) => listeners.add(cb),
      removeEventListener: (_: string, cb: ChangeListener) =>
        listeners.delete(cb),
    }
  })

  vi.stubGlobal('matchMedia', matchMedia)

  return {
    listeners,
    emit: (next: boolean) => {
      matches = next
      listeners.forEach((cb) => cb({ matches: next }))
    },
  }
}
