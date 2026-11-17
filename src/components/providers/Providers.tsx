'use client'

import { useSetAtom, Provider } from 'jotai'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo } from 'react'

import { AlgoliaProvider } from '@/components/providers/AlgoliaProvider'
import { CompositionProvider } from '@/components/providers/CompositionProvider'
import { useResetVerticalScopedState } from '@/components/providers/hooks/useResetVerticalScopedState'
import { InstantSearchProvider } from '@/components/providers/InstantSearchProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { useAlgoliaEnvironment } from '@/hooks/useAlgoliaEnvironment'
import { resolveVerticalConfig } from '@/lib/resolve-vertical-config'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { VerticalConfig } from '@/types'

interface ProvidersProps {
  config: VerticalConfig
  children: React.ReactNode
}

const InnerProviders = ({ config, children }: ProvidersProps) => {
  const setActiveConfig = useSetAtom(activeConfigAtom)
  const pathname = usePathname()?.replace(/\/+$/, '')
  const routeIndexKey = pathname
    ? config.algolia.searchRouteIndices?.[pathname]
    : undefined
  const searchIndexName =
    (routeIndexKey && config.algolia.indices[routeIndexKey]?.name) ||
    config.algolia.primaryIndex.name

  useEffect(() => {
    setActiveConfig(config)
    return () => setActiveConfig(null)
  }, [config, setActiveConfig])

  return (
    <div data-vertical={config.slug} className="flex min-h-screen flex-col">
      <ThemeProvider theme={config.theme}>
        <AlgoliaProvider
          appId={config.algolia.appId}
          apiKey={config.algolia.apiKey}>
          <CompositionProvider
            appId={config.algolia.appId}
            apiKey={config.algolia.apiKey}
            primaryIndexName={config.algolia.primaryIndex.name}
            replicas={config.algolia.primaryIndex.replicas}
            compositionConfig={config.features.composition}>
            <InstantSearchProvider indexName={searchIndexName}>
              {children}
            </InstantSearchProvider>
          </CompositionProvider>
        </AlgoliaProvider>
      </ThemeProvider>
    </div>
  )
}

export const Providers = ({ config, children }: ProvidersProps) => {
  const { environment } = useAlgoliaEnvironment()
  const resolvedConfig = useMemo(
    () => resolveVerticalConfig(config, environment),
    [config, environment],
  )

  // Anchored here, not in InnerProviders: this component survives the environment remount.
  useResetVerticalScopedState(config.slug)

  // A fresh store per environment: the tree mounts once, never with the outgoing client.
  return (
    <Provider key={environment}>
      <InnerProviders config={resolvedConfig}>{children}</InnerProviders>
    </Provider>
  )
}
