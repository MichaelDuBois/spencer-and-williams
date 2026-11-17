/**
 * Shared animation constants for consistent motion across the app.
 * Use these with Framer Motion or CSS transitions.
 */

// Durations (in seconds for Framer Motion)
export const DURATION_FAST = 0.15
export const DURATION_NORMAL = 0.2
export const DURATION_SLOW = 0.3
export const DURATION_LAYOUT = 0.5

// Easing curves
export const EASE_DEFAULT = [0.25, 0.1, 0.25, 1] as const
export const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const
export const EASE_LAYOUT = [0.76, 0, 0.24, 1] as const
export const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const

// Clip paths for reveal animations
export const CLIP_PATH_VISIBLE = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
export const CLIP_PATH_HIDDEN_RIGHT =
  'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
export const CLIP_PATH_HIDDEN_BOTTOM =
  'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)'

// Common transition presets
export const transitionFast = {
  duration: DURATION_FAST,
  ease: EASE_DEFAULT,
} as const

export const transitionNormal = {
  duration: DURATION_NORMAL,
  ease: EASE_DEFAULT,
} as const

export const transitionSmooth = {
  duration: DURATION_NORMAL,
  ease: EASE_SMOOTH,
} as const

export const transitionSlow = {
  duration: DURATION_SLOW,
  ease: EASE_SMOOTH,
} as const

// Longer, gliding entrance — smoother travel on the y-axis
export const transitionFluid = {
  duration: DURATION_LAYOUT,
  ease: EASE_SMOOTH,
} as const

// Motion prop presets — spread onto <motion.*> elements

export const scrollFadeIn = (y = 16) =>
  ({
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
  }) as const

export const scrollScaleX = {
  initial: { scaleX: 0 },
  whileInView: { scaleX: 1 },
  viewport: { once: true, margin: '-50px' },
} as const

export const enterFadeIn = (y = 16) =>
  ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
  }) as const
