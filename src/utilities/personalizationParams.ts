import type { PersonalizationMode } from '@/hooks/usePersonalization'

interface IsPersonalizationActiveArgs {
  mode: PersonalizationMode
  /** The vertical's `features.personalization.enabled` flag. */
  isFeatureEnabled?: boolean
}

export const isPersonalizationActive = ({
  mode,
  isFeatureEnabled,
}: IsPersonalizationActiveArgs): boolean =>
  Boolean(isFeatureEnabled) && (mode === 'persona' || mode === 'realtime')

/** Everything a search request needs to know about the active persona. */
export interface PersonalizationState {
  isActive: boolean
  currentUserToken?: string
  currentOptionalFilters?: string[]
}

/** The persona fields of a search request. */
export interface PersonaSearchParams {
  userToken?: string
  enablePersonalization?: boolean
  optionalFilters?: string[]
}

export interface PersonalizationSearchParams extends PersonaSearchParams {
  ruleContexts?: string[]
  getRankingInfo?: boolean
}

interface GetPersonalizationSearchParamsArgs {
  personalization?: PersonalizationState
  /** Pinning rules: dropped while a persona is active, so pins can't fight the re-rank. */
  ruleContexts?: string[]
  /** Filtering rules: no conflict with the re-rank, so always sent. */
  filterRuleContexts?: string[]
}

export const getPersonalizationSearchParams = ({
  personalization,
  ruleContexts,
  filterRuleContexts,
}: GetPersonalizationSearchParamsArgs): PersonalizationSearchParams => {
  const isActive = Boolean(personalization?.isActive)

  const contexts = [
    ...(filterRuleContexts ?? []),
    ...(isActive ? [] : (ruleContexts ?? [])),
  ]

  return {
    ...(contexts.length ? { ruleContexts: contexts } : {}),
    ...(personalization?.currentUserToken
      ? { userToken: personalization.currentUserToken }
      : {}),
    ...(isActive
      ? {
          enablePersonalization: true,
          optionalFilters: personalization?.currentOptionalFilters,
          getRankingInfo: true,
        }
      : {}),
  }
}
