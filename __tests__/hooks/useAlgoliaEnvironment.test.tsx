import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAlgoliaEnvironment } from '@/hooks/useAlgoliaEnvironment'
import {
  algoliaEnvironmentAtom,
  algoliaEnvironmentStore,
} from '@/stores/algoliaEnvironment'

import {
  buildJotaiWrapper,
  createTestStore,
} from '@tests/helpers/jotai-wrapper'

const { trackMock } = vi.hoisted(() => {
  return { trackMock: vi.fn() }
})
vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

describe('useAlgoliaEnvironment', () => {
  beforeEach(() => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'production')
    trackMock.mockClear()
  })

  it('defaults to production', () => {
    const { result } = renderHook(() => useAlgoliaEnvironment())

    expect(result.current.environment).toBe('production')
    expect(result.current.isStaging).toBe(false)
  })

  it('reads the default store from inside a scoped Provider', () => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')

    const { result } = renderHook(() => useAlgoliaEnvironment(), {
      wrapper: buildJotaiWrapper(createTestStore()),
    })

    expect(result.current.environment).toBe('staging')
    expect(result.current.isStaging).toBe(true)
  })

  it('writes to the default store from inside a scoped Provider', () => {
    const scopedStore = createTestStore()

    const { result } = renderHook(() => useAlgoliaEnvironment(), {
      wrapper: buildJotaiWrapper(scopedStore),
    })

    act(() => result.current.setEnvironment('staging'))

    expect(algoliaEnvironmentStore.get(algoliaEnvironmentAtom)).toBe('staging')
    expect(scopedStore.get(algoliaEnvironmentAtom)).toBe('production')
  })

  it.each([
    ['production', 'staging'],
    ['staging', 'production'],
  ] as const)('tracks the switch from %s to %s', (from, to) => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, from)
    const { result } = renderHook(() => useAlgoliaEnvironment())

    act(() => result.current.setEnvironment(to))

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('environment_switched', {
      from,
      to,
    })
  })

  it('tracks nothing when the environment does not change', () => {
    const { result } = renderHook(() => useAlgoliaEnvironment())

    act(() => result.current.setEnvironment('production'))

    expect(trackMock).not.toHaveBeenCalled()
  })
})
