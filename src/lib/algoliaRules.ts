interface AlgoliaRuleCondition {
  context?: string
  pattern?: string
  anchoring?: string
}

interface AlgoliaRuleConsequence {
  params?: Record<string, unknown>
  promote?: unknown[]
  hide?: unknown[]
}

/** Only the fields we read — a rule carries plenty more we have no use for. */
export interface AlgoliaRule {
  objectID: string
  enabled?: boolean
  description?: string
  conditions?: AlgoliaRuleCondition[]
  consequence?: AlgoliaRuleConsequence
  _metadata?: { lastUpdate?: number }
}

interface AlgoliaRulesCredentials {
  appId: string
  apiKey: string
}

interface FetchIndexRulesArgs {
  credentials: AlgoliaRulesCredentials
  indexName: string
}

/**
 * Lists an index's rules. Returns null when they can't be read — the key needs
 * the `settings` ACL — so callers can fall back to whatever their config
 * declares rather than rendering nothing.
 *
 * Plain `fetch` rather than a client: the app imports `algoliasearch/lite`,
 * which has no `searchRules`, and pulling the full `algoliasearch` client in for
 * this one endpoint would add it to the media bundle.
 */
export const fetchIndexRules = async ({
  credentials,
  indexName,
}: FetchIndexRulesArgs): Promise<AlgoliaRule[] | null> => {
  try {
    const response = await fetch(
      `https://${credentials.appId}-dsn.algolia.net/1/indexes/${indexName}/rules/search`,
      {
        method: 'POST',
        headers: {
          'X-Algolia-API-Key': credentials.apiKey,
          'X-Algolia-Application-Id': credentials.appId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hitsPerPage: 1000 }),
      },
    )

    if (!response.ok) return null

    const { hits } = (await response.json()) as { hits?: AlgoliaRule[] }

    return hits ?? []
  } catch {
    return null
  }
}
