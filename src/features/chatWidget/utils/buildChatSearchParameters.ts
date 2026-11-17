import type {
  PersonaSearchParams,
  PersonalizationSearchParams,
} from '@/utilities/personalizationParams'

/** Agent Studio's per-index search override, limited to the persona fields. */
export type ChatSearchParameters = Record<string, PersonaSearchParams>

/** The primary index plus any configured extras, deduped and without blanks. */
export const getChatSearchIndexNames = (
  primaryIndexName: string | undefined,
  extraIndexNames: string[] = [],
): string[] => [
  ...new Set(
    [primaryIndexName, ...extraIndexNames]
      .map((name) => name?.trim())
      .filter((name): name is string => Boolean(name)),
  ),
]

/** Builds `algolia.searchParameters`, or `undefined` when there is nothing to send. */
export const buildChatSearchParameters = (
  indexNames: string[],
  params: PersonalizationSearchParams,
): ChatSearchParameters | undefined => {
  // Agent Studio rejects unknown fields, so getRankingInfo and ruleContexts stay out.
  const override: PersonaSearchParams = {
    ...(params.userToken ? { userToken: params.userToken } : {}),
    ...(params.enablePersonalization !== undefined
      ? { enablePersonalization: params.enablePersonalization }
      : {}),
    ...(params.enablePersonalization && params.optionalFilters?.length
      ? { optionalFilters: params.optionalFilters }
      : {}),
  }

  if (indexNames.length === 0 || Object.keys(override).length === 0) {
    return undefined
  }

  return Object.fromEntries(indexNames.map((name) => [name, override]))
}
