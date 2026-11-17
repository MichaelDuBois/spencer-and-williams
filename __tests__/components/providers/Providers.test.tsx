import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { travelConfig } from '@/app/travel/config'
import { Providers } from '@/components/providers/Providers'
import type { AlgoliaEnvironment } from '@/stores/algoliaEnvironment'
import {
  chatWidgetEnabledAtom,
  demoOptionsStore,
  neuralSearchEnabledAtom,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'
import {
  geoSearchStateAtom,
  geoSearchStore,
  resetGeoSearchStateAtom,
} from '@/stores/geoSearch'
import {
  groceryDeliveryMethodAtom,
  groceryDeliveryMethodStore,
  resetGroceryDeliveryMethodAtom,
} from '@/stores/groceryDeliveryMethod'
import {
  activePersonaAtom,
  personalizationStore,
  resetPersonalizationAtom,
} from '@/stores/personalization'
import type { Persona } from '@/types'

import { createMockConfig } from '@tests/helpers/test-utils'

import type { ReactNode } from 'react'

let environment: AlgoliaEnvironment = 'production'
let pathname = '/travel/search'
const renderedIndex = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => {
  return { usePathname: () => pathname }
})

vi.mock('@/hooks/useAlgoliaEnvironment', () => {
  return {
    useAlgoliaEnvironment: () => {
      return {
        environment,
        isStaging: environment === 'staging',
        setEnvironment: vi.fn(),
        hasAcknowledgedStagingNotice: true,
        acknowledgeStagingNotice: vi.fn(),
      }
    },
  }
})

vi.mock('@/components/providers/AlgoliaProvider', () => {
  return {
    AlgoliaProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  }
})
vi.mock('@/components/providers/CompositionProvider', () => {
  return {
    CompositionProvider: ({ children }: { children: ReactNode }) => (
      <>{children}</>
    ),
  }
})
vi.mock('@/components/providers/InstantSearchProvider', () => {
  return {
    InstantSearchProvider: ({
      children,
      indexName,
    }: {
      children: ReactNode
      indexName: string
    }) => {
      renderedIndex(indexName)
      return <>{children}</>
    },
  }
})

const persona = {
  type: 'persona',
  id: 'p1',
  label: 'Persona One',
  description: '',
  token: 'token-1',
  affinities: {},
  optionalFilters: [],
} satisfies Persona

const configA = createMockConfig({ slug: 'ecommerce', theme: 'ecommerce' })
const configB = createMockConfig({ slug: 'fashion', theme: 'fashion' })

const seedState = () => {
  personalizationStore.set(activePersonaAtom, persona)
  demoOptionsStore.set(neuralSearchEnabledAtom, false)
  demoOptionsStore.set(chatWidgetEnabledAtom, true)
  groceryDeliveryMethodStore.set(groceryDeliveryMethodAtom, 'pickup')
  geoSearchStore.set(geoSearchStateAtom, {
    mode: 'boundingBox',
    center: { lat: 1, lng: 2 },
    boundingBox: null,
  })
}

describe('Providers', () => {
  beforeEach(() => {
    environment = 'production'
    pathname = '/travel/search'
    renderedIndex.mockClear()
    personalizationStore.set(resetPersonalizationAtom)
    demoOptionsStore.set(resetDemoOptionsAtom)
    groceryDeliveryMethodStore.set(resetGroceryDeliveryMethodAtom)
    geoSearchStore.set(resetGeoSearchStateAtom)
  })

  it('uses the podcast index only on the dedicated travel podcast page', () => {
    const { rerender } = render(
      <Providers config={travelConfig}>
        <div />
      </Providers>,
    )
    expect(renderedIndex).toHaveBeenLastCalledWith(
      travelConfig.algolia.primaryIndex.name,
    )
    pathname = '/travel/search/podcasts'
    rerender(
      <Providers config={travelConfig}>
        <div />
      </Providers>,
    )
    expect(renderedIndex).toHaveBeenLastCalledWith(
      travelConfig.algolia.indices.podcasts.name,
    )
    pathname = '/travel/search/articles'
    rerender(
      <Providers config={travelConfig}>
        <div />
      </Providers>,
    )
    expect(renderedIndex).toHaveBeenLastCalledWith(
      travelConfig.algolia.primaryIndex.name,
    )
    pathname = '/travel/search/podcasts/'
    rerender(
      <Providers config={travelConfig}>
        <div />
      </Providers>,
    )
    expect(renderedIndex).toHaveBeenLastCalledWith(
      travelConfig.algolia.indices.podcasts.name,
    )
    rerender(
      <Providers config={configA}>
        <div />
      </Providers>,
    )
    expect(renderedIndex).toHaveBeenLastCalledWith(
      configA.algolia.primaryIndex.name,
    )
  })

  it('resolves configured routes for any vertical and falls back for missing indices', () => {
    const config = createMockConfig()
    const mappedConfig = {
      ...config,
      algolia: {
        ...config.algolia,
        searchRouteIndices: { '/custom/search': 'secondary' },
        indices: { secondary: { name: 'secondary-index' } },
      },
    }
    pathname = '/custom/search'
    const { rerender } = render(
      <Providers config={mappedConfig}>
        <div />
      </Providers>,
    )
    expect(renderedIndex).toHaveBeenLastCalledWith('secondary-index')
    rerender(
      <Providers
        config={{
          ...mappedConfig,
          algolia: { ...mappedConfig.algolia, indices: {} },
        }}>
        <div />
      </Providers>,
    )
    expect(renderedIndex).toHaveBeenLastCalledWith(
      config.algolia.primaryIndex.name,
    )
  })

  it('resets the pinned per-vertical state when the vertical slug changes', () => {
    const { rerender } = render(
      <Providers config={configA}>
        <div />
      </Providers>,
    )

    seedState()

    rerender(
      <Providers config={configB}>
        <div />
      </Providers>,
    )

    expect(personalizationStore.get(activePersonaAtom)).toBeNull()
    expect(demoOptionsStore.get(neuralSearchEnabledAtom)).toBe(true)
    expect(demoOptionsStore.get(chatWidgetEnabledAtom)).toBe(false)
    expect(groceryDeliveryMethodStore.get(groceryDeliveryMethodAtom)).toBe(
      'delivery',
    )
    expect(geoSearchStore.get(geoSearchStateAtom)).toEqual({
      mode: 'radius',
      center: null,
      boundingBox: null,
    })
  })

  it('keeps the pinned per-vertical state across an environment toggle', () => {
    const { rerender } = render(
      <Providers config={configA}>
        <div />
      </Providers>,
    )

    seedState()

    environment = 'staging'
    rerender(
      <Providers config={configA}>
        <div />
      </Providers>,
    )

    expect(personalizationStore.get(activePersonaAtom)).toEqual(persona)
    expect(demoOptionsStore.get(neuralSearchEnabledAtom)).toBe(false)
    expect(demoOptionsStore.get(chatWidgetEnabledAtom)).toBe(true)
    expect(groceryDeliveryMethodStore.get(groceryDeliveryMethodAtom)).toBe(
      'pickup',
    )
    expect(geoSearchStore.get(geoSearchStateAtom)).toEqual({
      mode: 'boundingBox',
      center: { lat: 1, lng: 2 },
      boundingBox: null,
    })
  })
})
