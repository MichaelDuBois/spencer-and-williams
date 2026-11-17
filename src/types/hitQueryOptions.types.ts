export interface HitQueryOptions {
  filters?: string
  enabled?: boolean
  isHitValid?: (hit: unknown) => boolean
  ruleContexts?: string[]
  /** Fields needed by the validator when a caller trims the search payload. */
  requiredAttributes?: string[]
}
