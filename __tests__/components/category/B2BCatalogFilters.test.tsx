import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CategoryPage } from '@/components/category/CategoryPage'
import { CollectionPage } from '@/components/collection/CollectionPage'
import { StoreFilterConfigure } from '@/components/results/StoreFilterConfigure'
import { activeConfigAtom } from '@/stores/activeConfig'
import { setPersonaModeAtom } from '@/stores/personalization'
import { selectedStoreAtom } from '@/stores/selectedStore'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import {
  buildJotaiWrapper,
  createTestStore,
} from '@tests/helpers/jotai-wrapper'
import { createMockConfig } from '@tests/helpers/test-utils'

const route = vi.hoisted(() => {
  return { slug: 'tools', query: '' }
})
vi.mock('next/navigation', () => {
  return {
    useParams: () => {
      return { slug: route.slug }
    },
    useSearchParams: () => new URLSearchParams(route.query),
  }
})
vi.mock('@/hooks/useScrollToTop', () => {
  return { useScrollToTop: () => undefined }
})
vi.mock('@/hooks/useStoreIdFilter', async () => {
  const { useAtomValue } = await import('jotai')
  const { selectedStoreAtom } = await import('@/stores/selectedStore')
  return {
    useStoreIdFilter: () => {
      return {
        storeId: useAtomValue(selectedStoreAtom)?.storeId ?? null,
      }
    },
  }
})
vi.mock('react-instantsearch', () => {
  return {
    Index: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Configure: (props: Record<string, unknown>) => (
      <output data-testid="parameters">{JSON.stringify(props)}</output>
    ),
  }
})

const setup = () => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'b2b-warehouse',
        navigation: [{ label: 'Tools', category: 'Tools' }],
        collections: [{ collection: 'Tools', label: 'Tools' }],
      }),
    )
    s.set(setPersonaModeAtom, GROUP_0)
    s.set(selectedStoreAtom, { vertical: 'b2b-warehouse', storeId: '1' })
  })
  return { store, wrapper: buildJotaiWrapper(store) }
}

describe('B2B product Configure filters', () => {
  beforeEach(() => {
    route.slug = 'tools'
    route.query = ''
  })
  it.each([
    [
      'category',
      <CategoryPage key="category" indexId="category">
        {() => null}
      </CategoryPage>,
      'categoryPageId:"Tools"',
    ],
    [
      'collection',
      <CollectionPage key="collection" indexId="collection">
        {() => null}
      </CollectionPage>,
      '_collections:"Tools"',
    ],
    ['search', <StoreFilterConfigure key="search" />, ''],
  ])(
    'preserves %s constraints and follows group/warehouse selection without a URL param',
    (_name, element, prefix) => {
      const { store, wrapper } = setup()
      render(element, { wrapper })
      const filters = (group: string, warehouse?: string) =>
        [
          prefix,
          `visible_by:"${group}"`,
          warehouse && `availableInStores.objectID:"${warehouse}"`,
        ]
          .filter(Boolean)
          .join(' AND ')
      expect(
        JSON.parse(screen.getByTestId('parameters').textContent!).filters,
      ).toBe(filters(GROUP_0.groupId, '1'))
      act(() => store.set(setPersonaModeAtom, GROUP_1))
      expect(
        JSON.parse(screen.getByTestId('parameters').textContent!).filters,
      ).toBe(filters(GROUP_1.groupId, '1'))
      act(() => store.set(selectedStoreAtom, null))
      expect(
        JSON.parse(screen.getByTestId('parameters').textContent!).filters,
      ).toBe(filters(GROUP_1.groupId))
    },
  )

  it.each([
    [
      'category',
      <CategoryPage key="category" indexId="category">
        {() => null}
      </CategoryPage>,
      'categoryPageId:"Tools"',
    ],
    [
      'collection',
      <CollectionPage key="collection" indexId="collection">
        {() => null}
      </CollectionPage>,
      '_collections:"Tools"',
    ],
  ])(
    'uses a B2B warehouse from the URL in the initial %s request',
    (_name, element, prefix) => {
      route.query = 'storeId=old'
      const { store, wrapper } = setup()
      store.set(selectedStoreAtom, null)
      render(element, { wrapper })
      expect(
        JSON.parse(screen.getByTestId('parameters').textContent!).filters,
      ).toBe(
        `${prefix} AND visible_by:"customer_group_0" AND availableInStores.objectID:"old"`,
      )
    },
  )

  it.each([
    [
      'category',
      <CategoryPage key="category" indexId="category">
        {() => null}
      </CategoryPage>,
      (groupId: string | null) =>
        groupId ? [groupId] : undefined,
    ],
    [
      'collection',
      <CollectionPage key="collection" indexId="collection">
        {() => null}
      </CollectionPage>,
      (groupId: string | null) =>
        groupId ? [groupId, 'collection-tools'] : ['collection-tools'],
    ],
  ])(
    'sends the customer group context for %s requests',
    (_name, element, expectedContexts) => {
      const { store, wrapper } = setup()
      render(element, { wrapper })
      const parameters = () =>
        JSON.parse(screen.getByTestId('parameters').textContent!) as {
          ruleContexts?: string[]
        }

      expect(parameters().ruleContexts).toEqual(expectedContexts(GROUP_0.groupId))
      act(() => store.set(setPersonaModeAtom, GROUP_1))
      expect(parameters().ruleContexts).toEqual(expectedContexts(GROUP_1.groupId))
      act(() => store.set(setPersonaModeAtom, null))
      expect(parameters().ruleContexts).toEqual(expectedContexts(null))
    },
  )
})
