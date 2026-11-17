export type Variant = 'standard' | 'editorial'

export interface VariantClasses {
  wrapper: string
  header: string
  title: string
  headerIcon: string
  progressTrackInset: string
  progressFillInset: string
  progressTrackThickness: string
  progressTrackBg: string
  progressFillBg: string
  stepIconSize: string
  circle: string
  circleCompleted: string
  circleIncomplete: string
  label: string
  labelCompleted: string
  labelIncomplete: string
  date: string
  link: string
}

export interface DeliveryTrackerProps {
  variant: Variant
  /** Order date the timeline is anchored to, as an epoch timestamp. */
  createdAt: number
}
