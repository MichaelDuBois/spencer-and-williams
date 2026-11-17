import {
  QueryClient,
  QueryClientContext,
  useQuery,
  type QueryKey,
} from '@tanstack/react-query'
import { useContext } from 'react'

const DIRECT_DATA_QUERY_CLIENT = new QueryClient()

/**
 * Subscribes to a React Query cache entry without ever triggering a network fetch.
 *
 * The streaming layer populates the cache via `queryClient.setQueryData(...)` in the
 * search hooks; cards use this hook to read that pre-cached data and re-render when
 * it arrives. Returns `undefined` until the cache is populated, allowing callers to
 * render their own loading skeletons.
 */
export const useCachedContent = <T>(
  queryKey: QueryKey,
  isEnabled = true,
): T | undefined => {
  const providerClient = useContext(QueryClientContext)
  const queryClient = providerClient ?? DIRECT_DATA_QUERY_CLIENT
  const cached = queryClient.getQueryData<T>(queryKey)

  const { data } = useQuery<T>(
    {
      queryKey,
      queryFn: () => queryClient.getQueryData<T>(queryKey)!,
      staleTime: Infinity,
      enabled:
        isEnabled && providerClient !== undefined && cached !== undefined,
    },
    queryClient,
  )

  return data
}

/** Uses tool-provided data when available, otherwise subscribes to its cache entry. */
export const useCardData = <T>(
  directData: T | undefined,
  queryKey: QueryKey,
): T | undefined => {
  const cachedData = useCachedContent<T>(queryKey, directData === undefined)

  return directData ?? cachedData
}
