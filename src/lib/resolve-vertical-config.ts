import type { AlgoliaEnvironment } from '@/stores/algoliaEnvironment'
import type { VerticalConfig, VerticalStagingOverrides } from '@/types'

const hasStagingCredentials = (
  staging?: VerticalStagingOverrides,
): staging is VerticalStagingOverrides =>
  Boolean(staging?.appId && staging?.apiKey)

export const hasStagingConfig = (config: VerticalConfig): boolean =>
  hasStagingCredentials(config.staging)

/** Swaps in the vertical's staging app, inheriting every ID it doesn't override. */
export const resolveVerticalConfig = (
  config: VerticalConfig,
  environment: AlgoliaEnvironment,
): VerticalConfig => {
  const { staging } = config
  if (environment === 'production' || !hasStagingCredentials(staging))
    return config

  // Stays absent when neither side declares it: `{}` would surface the demo toggle.
  const composition =
    config.features.composition || staging.composition
      ? { ...config.features.composition, ...staging.composition }
      : undefined

  return {
    ...config,
    algolia: {
      ...config.algolia,
      appId: staging.appId,
      apiKey: staging.apiKey,
    },
    features: {
      ...config.features,
      agentStudio: { ...config.features.agentStudio, ...staging.agentStudio },
      ...(composition && { composition }),
    },
  }
}
