import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { CompositionProvider } from '@/components/providers/CompositionProvider'
import {
  compositionEnabledAtom,
  demoOptionsStore,
} from '@/stores/demoOptions'
import {
  baseSearchClientAtom,
  searchClientAtom,
  searchClientKeyAtom,
} from '@/stores/searchClient'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper } from '@tests/helpers/test-utils'

import type { liteClient } from 'algoliasearch/lite'

type SearchClient = ReturnType<typeof liteClient>

const baseClient = {
  search: async () => {
    return { results: [] }
  },
  addAlgoliaAgent: () => {},
} as unknown as SearchClient

const renderProvider = ({ enabled = true, compositionId = 'comp-1' } = {}) => {
  demoOptionsStore.set(compositionEnabledAtom, enabled)

  const store = createTestStore((s) => {
    s.set(baseSearchClientAtom, baseClient)
  })

  const { Wrapper } = buildProvidersWrapper({ store })

  render(
    <Wrapper>
      <CompositionProvider
        appId="APP_ID"
        apiKey="API_KEY"
        primaryIndexName="test_index"
        compositionConfig={compositionId ? { compositionId } : undefined}>
        <div />
      </CompositionProvider>
    </Wrapper>,
  )

  return store
}

describe('CompositionProvider', () => {
  beforeEach(() => {
    demoOptionsStore.set(compositionEnabledAtom, true)
  })

  it('installs the composition client and labels it while composition is on', async () => {
    const store = renderProvider()

    await waitFor(() =>
      expect(store.get(searchClientKeyAtom)).toBe('composition'),
    )
    expect(store.get(searchClientAtom)).not.toBe(baseClient)
  })

  it('installs the base client and labels it while composition is off', async () => {
    const store = renderProvider({ enabled: false })

    await waitFor(() => expect(store.get(searchClientKeyAtom)).toBe('standard'))
    expect(store.get(searchClientAtom)).toBe(baseClient)
  })

  it('labels the client standard when the vertical configures no composition', async () => {
    const store = renderProvider({ compositionId: '' })

    await waitFor(() => expect(store.get(searchClientKeyAtom)).toBe('standard'))
    expect(store.get(searchClientAtom)).toBe(baseClient)
  })

  it('moves the key in the same commit as the client it describes', async () => {
    const store = renderProvider()

    await waitFor(() =>
      expect(store.get(searchClientKeyAtom)).toBe('composition'),
    )

    // The toggle flips during render; the client is swapped in an effect. A key
    // read off the toggle would already say 'standard' here while the
    // composition client was still installed, which is what let consumers cache
    // the outgoing client's results against the incoming client's identity.
    demoOptionsStore.set(compositionEnabledAtom, false)

    await waitFor(() => expect(store.get(searchClientAtom)).toBe(baseClient))
    expect(store.get(searchClientKeyAtom)).toBe('standard')
  })

  it('clears both the client and its key on unmount', async () => {
    demoOptionsStore.set(compositionEnabledAtom, true)

    const store = createTestStore((s) => {
      s.set(baseSearchClientAtom, baseClient)
    })
    const { Wrapper } = buildProvidersWrapper({ store })

    const { unmount } = render(
      <Wrapper>
        <CompositionProvider
          appId="APP_ID"
          apiKey="API_KEY"
          primaryIndexName="test_index"
          compositionConfig={{ compositionId: 'comp-1' }}>
          <div />
        </CompositionProvider>
      </Wrapper>,
    )

    await waitFor(() =>
      expect(store.get(searchClientKeyAtom)).toBe('composition'),
    )

    unmount()

    expect(store.get(searchClientAtom)).toBeNull()
    expect(store.get(searchClientKeyAtom)).toBeNull()
  })
})
