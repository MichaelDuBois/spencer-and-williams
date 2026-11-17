import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

vi.mock('next/image', () => {
  return {
    default: (props: Record<string, unknown>) => {
      const imgProps = Object.fromEntries(
        Object.entries(props).filter(
          ([key]) => !['fill', 'priority', 'sizes'].includes(key),
        ),
      )
      return <img {...imgProps} />
    },
  }
})

/**
 * jsdom does not implement IntersectionObserver, and `motion/react`'s viewport
 * feature constructs one unguarded as soon as a component mounts with
 * `whileInView` (framer-motion `InViewFeature.mount` -> `observeIntersection`).
 * Any component using the shared `scrollFadeIn` preset would therefore throw
 * `ReferenceError: IntersectionObserver is not defined` on render.
 *
 * Deliberately minimal: it satisfies the constructor and the observer protocol
 * and never fires a callback, so `whileInView` elements simply stay at their
 * `initial` state in tests. Do not grow this into an intersection simulator —
 * assert on the DOM, not on animation state.
 */
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  },
)

/**
 * jsdom does not implement ResizeObserver either, and hooks that cache layout
 * metrics construct one unguarded on mount. Same rule as above: it satisfies the
 * protocol and never fires. Tests that need a re-measure dispatch the `resize`
 * event those hooks also listen for.
 */
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

/**
 * jsdom does not implement matchMedia, and `useMediaQuery` reads it during render,
 * so any component behind the assistant's breakpoint check throws without it.
 * Reports no match — the desktop path. A test that needs a matching query, or a
 * live `change` event, installs its own with `installMatchMedia`.
 */
vi.stubGlobal('matchMedia', (query: string) => {
  return {
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }
})

// Autocomplete scrolls the active item into view during keyboard navigation.
// jsdom does not implement this browser method.
HTMLElement.prototype.scrollIntoView = vi.fn()

// Motion restores scroll position when measuring an animated auto-height panel.
window.scrollTo = vi.fn()

afterEach(() => cleanup())
