'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { useAlgoliaEnvironment } from '@/hooks/useAlgoliaEnvironment'
import type { AlgoliaEnvironment } from '@/stores/algoliaEnvironment'

interface QueryProviderProps {
  children: ReactNode
}

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
      },
    },
  })

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const { environment } = useAlgoliaEnvironment()

  // Query keys carry no appId, so each environment gets its own cache.
  const [clients] = useState<Record<AlgoliaEnvironment, QueryClient>>(() => {
    return {
      production: createQueryClient(),
      staging: createQueryClient(),
    }
  })

  // Invariant: every `useQuery` consumer lives under the vertical tree that `key={environment}` remounts.
  return (
    <QueryClientProvider client={clients[environment]}>
      {children}
    </QueryClientProvider>
  )
}
