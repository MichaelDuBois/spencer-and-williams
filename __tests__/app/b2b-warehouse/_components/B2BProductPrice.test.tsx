import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { B2BProductPrice } from '@/app/b2b-warehouse/_components/B2BProductPrice'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { PERSONAS } from '@/app/b2b-warehouse/personas'
import { ProductAutocompleteHit } from '@/components/autocomplete/hits/ProductAutocompleteHit'
import { Hit } from '@/components/hit/Hit'
import { ProductInfo } from '@/components/product/ProductInfo'
import { AssistantCatalogContext } from '@/features/aiAssistant/AssistantCatalogContext'
import { B2BWarehouseProductCard } from '@/features/aiAssistant/components/messages/b2b-warehouse/B2BWarehouseProductCard'
import { ProductContextCard } from '@/features/aiAssistant/components/ProductContextCard'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  setPersonaModeAtom,
  setRealtimeModeAtom,
} from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  createMockConfig,
  createMockSearchClient,
  createTestQueryClient,
  render,
} from '@tests/helpers/test-utils'

const { addItem } = vi.hoisted(() => {
  return { addItem: vi.fn() }
})
vi.mock('@/hooks/useCart', () => {
  return {
    useCart: () => {
      return { addItem }
    },
  }
})
vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendProductClickEvent: vi.fn(), sendAddToCartEvent: vi.fn() }
    },
  }
})
vi.mock('@/hooks/useRankingBadges', () => {
  return {
    useRankingBadges: () => {
      return { isComposed: false, isPersonalized: false }
    },
  }
})
vi.mock('@/hooks/useStoreIdFilter', () => {
  return {
    useStoreIdFilter: () => {
      return { storeId: null }
    },
  }
})
vi.mock('@/features/aiAssistant/hooks/ui/useAssistantLinkClick', () => {
  return { useAssistantLinkClick: () => vi.fn() }
})
vi.mock('react-instantsearch', () => {
  return { Highlight: () => <span>Drill</span> }
})

const raw = Object.freeze({
  objectID: 'A',
  name: 'Drill',
  price: '100',
  raw_price: 999,
})
const template = b2bWarehouseConfig.algolia.primaryIndex.template
if (!template) throw new Error('B2B product template missing')
const product = getB2BWarehouseProductHitValues(raw, template, 'b2b-warehouse')
const catalog = {
  queryOptions: {},
  productCacheKey: ['b2b-product', 'scope'],
  sessionKey: 'scope',
  isReady: true,
  context: '',
  productContext: product,
  priceComponent: B2BProductPrice,
  resetSession: vi.fn(),
}

const setup = (children: React.ReactNode) => {
  addItem.mockClear()
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
    s.set(setPersonaModeAtom, GROUP_0)
    s.set(
      baseSearchClientAtom,
      createMockSearchClient({
        search: vi.fn().mockResolvedValue({
          results: [
            {
              hits: [
                { ...raw, visible_by: [GROUP_0.groupId, GROUP_1.groupId] },
              ],
            },
          ],
        }),
      }),
    )
  })
  const queryClient = createTestQueryClient()
  queryClient.setQueryData([...catalog.productCacheKey, 'A'], product)
  return render(
    <AssistantCatalogContext.Provider value={catalog}>
      {children}
    </AssistantCatalogContext.Provider>,
    { store, queryClient },
  )
}

describe('B2B catalog price displays', () => {
  it.each([
    'hit',
    'recommendation',
    'autocomplete',
    'pdp',
    'assistant',
    'context',
  ])(
    'shows base/customer prices on %s and updates when the group changes',
    async (surface) => {
      const surfaces: Record<string, React.ReactNode> = {
        hit: (
          <Hit
            priceComponent={B2BProductPrice}
            slug="b2b-warehouse"
            variant="b2b-warehouse"
            item={raw}
            template={template}
            extractor={getB2BWarehouseProductHitValues}
          />
        ),
        recommendation: (
          <Hit
            priceComponent={B2BProductPrice}
            slug="b2b-warehouse"
            variant="standard"
            item={raw}
            template={template}
            extractor={getB2BWarehouseProductHitValues}
          />
        ),
        autocomplete: (
          <ProductAutocompleteHit
            priceComponent={B2BProductPrice}
            slug="b2b-warehouse"
            item={raw}
            template={template}
            extractor={getB2BWarehouseProductHitValues}
            onSelect={vi.fn()}
          />
        ),
        pdp: (
          <ProductInfo
            name="Drill"
            price={100}
            priceContent={<B2BProductPrice price={100} />}
          />
        ),
        assistant: (
          <B2BWarehouseProductCard
            product={{ objectID: 'A', why: 'Suitable' }}
          />
        ),
        context: <ProductContextCard />,
      }
      const { store } = setup(surfaces[surface])
      expect(screen.getByLabelText('Base price $100.00')).toBeInTheDocument()
      expect(screen.getByLabelText('Customer price $85.00')).toBeInTheDocument()
      act(() => store.set(setPersonaModeAtom, GROUP_1))
      expect(screen.getByLabelText('Customer price $70.00')).toBeInTheDocument()
      expect(screen.queryByText('$85.00')).not.toBeInTheDocument()
      if (['hit', 'recommendation', 'assistant', 'context'].includes(surface)) {
        fireEvent.click(screen.getByRole('button'))
        await waitFor(() =>
          expect(addItem).toHaveBeenCalledWith(
            expect.objectContaining({ objectID: 'A', price: 100 }),
          ),
        )
      }
      expect(raw.price).toBe('100')
      expect(product.price).toBe(100)
    },
  )

  it('rounds customer prices once and restores base prices for anonymous and realtime modes', () => {
    const { store, container } = setup(<B2BProductPrice price={15.9} />)
    expect(screen.getByText('$13.52')).toBeInTheDocument()
    act(() => store.set(setPersonaModeAtom, null))
    expect(screen.getByText('$15.90')).toBeInTheDocument()
    expect(container.querySelector('del')).toBeNull()
    act(() => store.set(setPersonaModeAtom, GROUP_1))
    expect(screen.getByText('$11.13')).toBeInTheDocument()
    act(() => store.set(setRealtimeModeAtom))
    expect(screen.getByText('$15.90')).toBeInTheDocument()
    act(() => store.set(setPersonaModeAtom, PERSONAS[0]))
    expect(screen.getByText('$15.90')).toBeInTheDocument()
    expect(container.querySelector('del')).toBeNull()
  })

  it.each([undefined, NaN, Infinity, -1])(
    'keeps unavailable price %s unavailable',
    (price) => {
      setup(
        <ProductInfo
          name="Drill"
          price={price}
          priceContent={
            <B2BProductPrice
              price={price}
              unavailableLabel="Price unavailable"
            />
          }
        />,
      )
      expect(screen.getByText('Price unavailable')).toBeInTheDocument()
      expect(screen.queryByText('$0.00')).not.toBeInTheDocument()
    },
  )

  it('supports a full discount and does not discount products from another vertical', () => {
    const { store } = setup(
      <>
        <B2BProductPrice price={100} />
        <ProductInfo name="Unrelated product" price={23.45} />
      </>,
    )
    act(() => store.set(setPersonaModeAtom, { ...GROUP_0, discount: 1 }))
    expect(screen.getByLabelText('Customer price $0.00')).toBeInTheDocument()
    expect(screen.getByText('$23.45')).toBeInTheDocument()
  })
})

it('does not display a quote for an invalid customer group', () => {
  const { store } = setup(
    <B2BProductPrice price={100} unavailableLabel="Price unavailable" />,
  )
  act(() => store.set(setPersonaModeAtom, { ...GROUP_0, discount: 2 }))
  expect(screen.getByText('Price unavailable')).toBeInTheDocument()
  expect(screen.queryByText('$100.00')).not.toBeInTheDocument()
})
