import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import type { EcommerceHitTemplate } from '@/app/ecommerce/types'
import type { FashionProductHitValues } from '@/app/fashion/hitValues.types'
import type { FashionHitTemplate } from '@/app/fashion/types'
import { Hit } from '@/components/hit/Hit'
import { HitActionContext } from '@/components/hit/HitActionContext'
import { VARIANT_CLASSES } from '@/components/hit/hitVariants'
import { RecommendModelContext } from '@/components/recommend/RecommendModelContext'
import type { HitExtractor } from '@/types/hitTemplate.types'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

vi.mock('react-instantsearch', () => {return {
  Highlight: ({ attribute }: { attribute: string }) => (
    <span data-testid="highlight" data-attribute={attribute} />
  ),
}})

const {
  addItemMock,
  sendProductClickEventMock,
  sendAddToCartEventMock,
  useRankingBadgesMock,
} = vi.hoisted(() => {return {
  addItemMock: vi.fn(),
  sendProductClickEventMock: vi.fn(),
  sendAddToCartEventMock: vi.fn(),
  useRankingBadgesMock: vi.fn(),
}})

vi.mock('@/hooks/useCart', () => {return {
  useCart: () => {return { addItem: addItemMock }},
}})

vi.mock('next/link', () => {return {
  default: ({ children, ...props }: React.ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}})

vi.mock('@/hooks/useStoreIdFilter', () => {return {
  useStoreIdFilter: () => {return { storeId: null, store: null, isLoading: false, clear: vi.fn() }},
}})

vi.mock('@/hooks/useInsightsEvents', () => {return {
  useInsightsEvents: () => {return {
    sendProductClickEvent: sendProductClickEventMock,
    sendAddToCartEvent: sendAddToCartEventMock,
  }},
}})

vi.mock('@/hooks/useRankingBadges', () => {return {
  useRankingBadges: () => useRankingBadgesMock(),
}})

const DEFAULT_RANKING_BADGES = {
  isComposed: false,
  isPersonalized: false,
  isSponsored: false,
  composedLabel: 'Promoted',
}

const ecomTemplate = {
  attributes: {
    name: 'name',
    brand: 'brand',
    image: 'image',
    price: 'price',
    category: 'category',
    description: 'description',
    productUrl: 'objectID',
    objectID: 'objectID',
  },
} as unknown as EcommerceHitTemplate

const fashionTemplate = {
  attributes: {
    name: 'name',
    brand: 'brand',
    image: 'image',
    price: 'price.value',
    description: 'description',
    sizes: 'sizes',
    productUrl: 'objectID',
    objectID: 'objectID',
  },
} as unknown as FashionHitTemplate

const hit = { objectID: 'p1' } as unknown as AlgoliaHit<BaseHit>

const attributedHit = {
  objectID: 'f1',
  __queryID: 'q1',
  __position: 4,
} as unknown as AlgoliaHit<BaseHit>

describe('Hit', () => {
  beforeEach(() => {
    addItemMock.mockClear()
    addItemMock.mockReturnValue(true)
    sendProductClickEventMock.mockClear()
    sendAddToCartEventMock.mockClear()
    useRankingBadgesMock.mockReset()
    useRankingBadgesMock.mockReturnValue(DEFAULT_RANKING_BADGES)
  })

  it('places the comparison action after the price inside the card and outside the link', () => {
    const extractor = (): EcommerceProductHitValues => {return {
      objectID: 'p1',
      productUrl: '/ecommerce/product/p1',
      name: 'Widget',
      price: 19.99,
    }}
    render(
      <HitActionContext.Provider value={<button type="button">Compare</button>}>
        <Hit variant="standard" item={hit} template={ecomTemplate} slug="ecommerce" extractor={extractor} />
      </HitActionContext.Provider>,
    )
    const action = screen.getByRole('button', { name: 'Compare' })
    const price = screen.getByText('$19.99')
    expect(action.closest('article')).toContainElement(price)
    expect(action.closest('a')).toBeNull()
    expect(price.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it.each([false, true])(
    'centers the fashion comparison action after the price (color variants: %s)',
    (hasColorVariants) => {
      const extractor = (): FashionProductHitValues => {return {
        objectID: 'f1',
        productUrl: '/fashion/product/f1',
        name: 'Dress',
        price: 49,
        ...(hasColorVariants && {
          colorVariants: [{ objectID: 'f1', name: 'Black', hex: '#000', href: '/fashion/product/f1' }],
        }),
      }}
      render(
        <HitActionContext.Provider value={<button type="button">Compare</button>}>
          <Hit variant="editorial" item={hit} template={fashionTemplate} slug="fashion" extractor={extractor} />
        </HitActionContext.Provider>,
      )
      const button = screen.getByRole('button', { name: 'Compare' })
      const price = screen.getByText('$49')
      expect(button.parentElement).toHaveClass('text-center')
      expect(button.closest('a')).toBeNull()
      expect(price.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    },
  )

  it('renders the standard variant with brand, category, rating, price, and add-to-cart', () => {
    const extractor = vi.fn(
      (): EcommerceProductHitValues => {return {
        objectID: 'p1',
        productUrl: '/ecommerce/product/p1',
        name: 'Widget',
        brand: 'Acme',
        category: 'Tools',
        image: 'https://cdn/img.jpg',
        price: 19.99,
      }},
    )

    const { container } = render(
      <Hit
        variant="standard"
        item={hit}
        template={ecomTemplate}
        slug="ecommerce"
        extractor={extractor}
      />,
    )

    expect(extractor).toHaveBeenCalledWith(hit, ecomTemplate, 'ecommerce')
    expect(screen.getByText('$19.99')).toBeInTheDocument()
    // category is rendered for standard variant when present
    expect(
      container.querySelector('[data-attribute="category"]'),
    ).toBeInTheDocument()
    // add-to-cart button is present
    expect(
      container.querySelector('button'),
    ).toBeInTheDocument()
    // image renders with extracted src
    expect(container.querySelector('img[src="https://cdn/img.jpg"]')).toBeInTheDocument()
    // link wraps the hit
    expect(container.querySelector('a[href="/ecommerce/product/p1"]')).toBeInTheDocument()
  })

  it('renders vertical-specific details through its generic extension slot', () => {
    const extractor = (): B2BWarehouseProductHitValues => {return {
      objectID: 'b2b-1',
      productUrl: '/b2b-warehouse/product/b2b-1',
      name: 'Warehouse Widget',
      sku: 'WW-123',
    }}

    render(
      <Hit
        variant="standard"
        item={hit}
        template={ecomTemplate}
        slug="b2b-warehouse"
        extractor={extractor}
        renderDetails={(values, renderHighlight) => (
          <>
            <p>SKU: {values.sku}</p>
            {renderHighlight('sku')}
          </>
        )}
      />,
    )

    expect(screen.getByText('SKU: WW-123')).toBeInTheDocument()
    expect(
      screen
        .getAllByTestId('highlight')
        .find((element) => element.dataset.attribute === 'sku'),
    ).toBeInTheDocument()
  })

  it('gives detail renderers the plain attribute when highlighting is disabled', () => {
    const extractor = (): B2BWarehouseProductHitValues => {return {
      objectID: 'b2b-1',
      productUrl: '/b2b-warehouse/product/b2b-1',
      name: 'Warehouse Widget',
      sku: 'WW-123',
    }}

    render(
      <Hit
        variant="standard"
        item={{ ...hit, sku: ['WW-123', 'WW-456'] }}
        template={ecomTemplate}
        slug="b2b-warehouse"
        extractor={extractor}
        disableHighlight
        renderDetails={(_values, renderHighlight) => (
          <p>SKU: {renderHighlight('sku')}</p>
        )}
      />,
    )

    expect(screen.getByText('SKU: WW-123, WW-456')).toBeInTheDocument()
    expect(
      screen
        .queryAllByTestId('highlight')
        .find((element) => element.dataset.attribute === 'sku'),
    ).toBeUndefined()
  })

  it('renders the editorial variant without category or rating but with a hover-revealed add-to-cart', () => {
    const extractor = vi.fn(
      (): FashionProductHitValues => {return {
        objectID: 'f1',
        productUrl: '/fashion/product/f1',
        name: 'Shirt',
        brand: 'Acme',
        price: 49,
      }},
    )

    const { container } = render(
      <Hit
        variant="editorial"
        item={hit}
        template={fashionTemplate}
        slug="fashion"
        extractor={extractor}
      />,
    )

    expect(screen.getByText('$49')).toBeInTheDocument()
    // category attribute should not be rendered for editorial variant
    expect(
      container.querySelector('[data-attribute="category"]'),
    ).not.toBeInTheDocument()
    // subtle add-to-cart button is present (revealed on group-hover via opacity)
    const addToCartButton = container.querySelector('button')
    expect(addToCartButton).toBeInTheDocument()
    expect(addToCartButton?.parentElement?.className).toContain('opacity-0')
    expect(addToCartButton?.parentElement?.className).toContain(
      'group-hover:opacity-100',
    )
    expect(container.querySelector('a[href="/fashion/product/f1"]')).toBeInTheDocument()
  })

  it('returns null when template is undefined', () => {
    const extractor = vi.fn()
    const { container } = render(
      <Hit
        variant="standard"
        item={hit}
        template={undefined as unknown as EcommerceHitTemplate}
        slug="ecommerce"
        extractor={extractor as unknown as HitExtractor<EcommerceProductHitValues, EcommerceHitTemplate>}
      />,
    )

    expect(container.firstChild).toBeNull()
    expect(extractor).not.toHaveBeenCalled()
  })

  it('omits the price node when price is undefined', () => {
    const extractor = vi.fn(
      (): EcommerceProductHitValues => {return {
        objectID: 'p2',
        productUrl: '/ecommerce/product/p2',
        name: 'No-price',
      }},
    )

    const { container } = render(
      <Hit
        variant="standard"
        item={hit}
        template={ecomTemplate}
        slug="ecommerce"
        extractor={extractor}
      />,
    )

    expect(container.querySelector('p.font-bold')).not.toBeInTheDocument()
  })

  it('adds the extracted product to the cart from the standard footer button', () => {
    const extractor = vi.fn(
      (): EcommerceProductHitValues => {return {
        objectID: 'p1',
        productUrl: '/ecommerce/product/p1',
        name: 'Widget',
        brand: 'Acme',
        category: 'Tools',
        image: 'https://cdn/img.jpg',
        price: 19.99,
      }},
    )

    const { container } = render(
      <Hit
        variant="standard"
        item={hit}
        template={ecomTemplate}
        slug="ecommerce"
        extractor={extractor}
      />,
    )

    fireEvent.click(container.querySelector('button')!)

    expect(addItemMock).toHaveBeenCalledWith({
      objectID: 'p1',
      name: 'Widget',
      image: 'https://cdn/img.jpg',
      price: 19.99,
      brand: 'Acme',
      quantity: 1,
    })
  })

  it('adds the extracted product to the cart from the editorial hover button', () => {
    const extractor = vi.fn(
      (): FashionProductHitValues => {return {
        objectID: 'f1',
        productUrl: '/fashion/product/f1',
        name: 'Shirt',
        brand: 'Acme',
        price: 49,
      }},
    )

    const { container } = render(
      <Hit
        variant="editorial"
        item={hit}
        template={fashionTemplate}
        slug="fashion"
        extractor={extractor}
      />,
    )

    fireEvent.click(container.querySelector('button')!)

    expect(addItemMock).toHaveBeenCalledWith({
      objectID: 'f1',
      name: 'Shirt',
      image: undefined,
      price: 49,
      brand: 'Acme',
      quantity: 1,
    })
  })

  describe('editorial colour variants', () => {
    const variantExtractor = (
      overrides: Partial<FashionProductHitValues> = {},
    ) =>
      vi.fn(
        (): FashionProductHitValues => {return {
          objectID: 'f1',
          productUrl: '/fashion/product/f1',
          name: 'Pumps',
          brand: 'Acme',
          price: 137.5,
          image: 'https://cdn/mocha.jpg',
          colorVariants: [
            {
              objectID: 'f1',
              hex: '#6c442c',
              name: 'mocha',
              href: '/fashion/product/f1',
              image: 'https://cdn/mocha.jpg',
              price: 137.5,
            },
            {
              objectID: 'v_blue',
              hex: '#0075BB',
              name: 'cobalt',
              href: '/fashion/product/v_blue',
              image: 'https://cdn/cobalt.jpg',
              price: 131.25,
            },
          ],
          ...overrides,
        }},
      )

    const renderEditorial = (
      overrides: Partial<FashionProductHitValues> = {},
    ) =>
      render(
        <Hit
          variant="editorial"
          item={attributedHit}
          template={fashionTemplate}
          slug="fashion"
          extractor={variantExtractor(overrides)}
        />,
      )

    // `ring-1` also appears as `focus-visible:ring-1` in the base classes, so
    // match the bare token to test the selected state rather than focus styles.
    const isRinged = (el: HTMLElement) =>
      /(?:^|\s)ring-1(?:\s|$)/.test(el.className)

    it('renders a swatch per colour variant, ringing the one for this record', () => {
      renderEditorial()

      expect(screen.getByLabelText('mocha')).toBeInTheDocument()
      const cobalt = screen.getByLabelText('cobalt')
      expect(cobalt).toBeInTheDocument()

      // The record's own colour reads as selected at rest.
      expect(isRinged(screen.getByLabelText('mocha'))).toBe(true)
      expect(isRinged(cobalt)).toBe(false)
    })

    it('swaps the image, link and price to the hovered colour variant', () => {
      const { container } = renderEditorial()

      expect(
        container.querySelector('img[src="https://cdn/mocha.jpg"]'),
      ).toBeInTheDocument()
      expect(screen.getByText('$137.5')).toBeInTheDocument()

      fireEvent.mouseEnter(screen.getByLabelText('cobalt'))

      expect(
        container.querySelector('img[src="https://cdn/cobalt.jpg"]'),
      ).toBeInTheDocument()
      expect(
        container.querySelector('a[href="/fashion/product/v_blue"]'),
      ).toBeInTheDocument()
      expect(screen.getByText('$131.25')).toBeInTheDocument()
      expect(isRinged(screen.getByLabelText('cobalt'))).toBe(true)
    })

    // Only the record was returned at this position for this query, so it is the
    // only objectID that may carry the queryID.
    it('reports the record with its search attribution when the card is clicked, even while a variant is previewed', () => {
      const { container } = renderEditorial()

      fireEvent.mouseEnter(screen.getByLabelText('cobalt'))
      fireEvent.click(container.querySelector('a')!)

      expect(sendProductClickEventMock).toHaveBeenCalledWith(
        {
          objectID: 'f1',
          __queryID: 'q1',
          __position: 4,
        },
        { surface: 'product_card' },
      )
    })

    it('sends an unattributed click for a colourway that was never in the results', () => {
      renderEditorial()

      fireEvent.click(screen.getByLabelText('cobalt'))

      // The swatch sits outside the card link, so it reports once — not twice.
      expect(sendProductClickEventMock).toHaveBeenCalledTimes(1)
      expect(sendProductClickEventMock).toHaveBeenCalledWith(
        {
          objectID: 'v_blue',
          __queryID: undefined,
          __position: undefined,
        },
        { surface: 'product_card' },
      )
    })

    it('keeps the search attribution when the clicked swatch is the record itself', () => {
      renderEditorial()

      fireEvent.click(screen.getByLabelText('mocha'))

      expect(sendProductClickEventMock).toHaveBeenCalledWith(
        {
          objectID: 'f1',
          __queryID: 'q1',
          __position: 4,
        },
        { surface: 'product_card' },
      )
    })

    describe('inside a Recommend carousel', () => {
      const renderInRecommend = () =>
        render(
          <RecommendModelContext.Provider value="related-products">
            <Hit
              variant="editorial"
              item={attributedHit}
              template={fashionTemplate}
              slug="fashion"
              extractor={variantExtractor()}
            />
          </RecommendModelContext.Provider>,
        )

      it('attributes a card click to the recommend surface and its model', () => {
        const { container } = renderInRecommend()

        fireEvent.click(container.querySelector('a')!)

        expect(sendProductClickEventMock).toHaveBeenCalledWith(
          {
            objectID: 'f1',
            __queryID: 'q1',
            __position: 4,
          },
          { surface: 'recommend', model: 'related-products' },
        )
      })

      it('attributes a swatch click to the recommend surface and its model', () => {
        renderInRecommend()

        fireEvent.click(screen.getByLabelText('cobalt'))

        expect(sendProductClickEventMock).toHaveBeenCalledWith(
          {
            objectID: 'v_blue',
            __queryID: undefined,
            __position: undefined,
          },
          { surface: 'recommend', model: 'related-products' },
        )
      })

      it('attributes an add to cart to the recommend surface and its model', () => {
        const { container } = renderInRecommend()

        fireEvent.click(container.querySelector('button')!)

        expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
        expect(sendAddToCartEventMock).toHaveBeenCalledWith(
          expect.objectContaining({ objectID: 'f1', queryID: 'q1' }),
          { surface: 'recommend', model: 'related-products' },
        )
      })
    })

    it('attributes an add to cart outside a Recommend carousel to the product card', () => {
      const { container } = renderEditorial()

      fireEvent.click(container.querySelector('button')!)

      expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
      const [, options] = sendAddToCartEventMock.mock.calls[0]
      expect(options).toEqual({ surface: 'product_card' })
      expect(options.model).toBeUndefined()
    })

    it('adds the previewed colourway to the cart rather than the record underneath', () => {
      const { container } = renderEditorial()

      fireEvent.mouseEnter(screen.getByLabelText('cobalt'))
      fireEvent.click(container.querySelector('button')!)

      expect(addItemMock).toHaveBeenCalledWith({
        objectID: 'v_blue',
        name: 'Pumps',
        brand: 'Acme',
        image: 'https://cdn/cobalt.jpg',
        price: 131.25,
        quantity: 1,
        queryID: undefined,
      })
    })

    it('adds the record with its queryID when no colourway is previewed', () => {
      const { container } = renderEditorial()

      fireEvent.click(container.querySelector('button')!)

      expect(addItemMock).toHaveBeenCalledWith({
        objectID: 'f1',
        name: 'Pumps',
        brand: 'Acme',
        image: 'https://cdn/mocha.jpg',
        price: 137.5,
        quantity: 1,
        queryID: 'q1',
      })
    })

    // Leaving the whole card (not the swatch row) is what resets, so the cursor
    // can travel from a swatch onto the card body and still click through.
    it('resets to the record once the pointer leaves the card', () => {
      const { container } = renderEditorial()

      fireEvent.mouseEnter(screen.getByLabelText('cobalt'))
      fireEvent.mouseLeave(container.querySelector('article')!)

      expect(
        container.querySelector('img[src="https://cdn/mocha.jpg"]'),
      ).toBeInTheDocument()
      expect(
        container.querySelector('a[href="/fashion/product/f1"]'),
      ).toBeInTheDocument()
      expect(screen.getByText('$137.5')).toBeInTheDocument()
    })

    it('caps the swatch row at three and counts the rest', () => {
      const colorVariants = Array.from({ length: 9 }, (_, i) => {return {
        objectID: `v${i}`,
        hex: '#000000',
        name: `colour-${i}`,
        href: `/fashion/product/v${i}`,
      }})

      renderEditorial({ colorVariants })

      expect(screen.getByLabelText('colour-2')).toBeInTheDocument()
      expect(screen.queryByLabelText('colour-3')).not.toBeInTheDocument()
      expect(screen.getByText('+6')).toBeInTheDocument()
    })

    it('keeps the swatch links outside the card link so they are not nested anchors', () => {
      const { container } = renderEditorial()

      const swatch = screen.getByLabelText('cobalt')
      expect(swatch.tagName).toBe('A')
      expect(swatch.getAttribute('href')).toBe('/fashion/product/v_blue')
      expect(container.querySelector('a a')).toBeNull()
    })

    it('omits the variant row on the standard variant even when the data is present', () => {
      render(
        <Hit
          variant="standard"
          item={hit}
          template={fashionTemplate}
          slug="fashion"
          extractor={variantExtractor()}
        />,
      )

      expect(screen.queryByLabelText('cobalt')).not.toBeInTheDocument()
    })
  })

  describe('grocery composed and sponsored hits', () => {
    const groceryExtractor = vi.fn(
      (): EcommerceProductHitValues => {return {
        objectID: 'g1',
        productUrl: '/grocery/product/g1',
        name: 'Ground Coffee',
        brand: 'Starbucks',
        price: 8.99,
      }},
    )

    const renderGrocery = () =>
      render(
        <Hit
          variant="grocery"
          item={hit}
          template={ecomTemplate}
          slug="grocery"
          extractor={groceryExtractor}
        />,
      )

    const COMPOSED_CLASSES = VARIANT_CLASSES.grocery.composedArticle.split(' ')
    const SPONSORED_CLASSES =
      VARIANT_CLASSES.grocery.sponsoredArticle?.split(' ') ?? []

    it('renders a sponsored hit with the Sponsored badge and the sponsored article classes', () => {
      useRankingBadgesMock.mockReturnValue({
        ...DEFAULT_RANKING_BADGES,
        isComposed: true,
        isSponsored: true,
        composedLabel: 'Sponsored',
      })
      renderGrocery()

      expect(SPONSORED_CLASSES).not.toHaveLength(0)
      expect(screen.getByText('• Sponsored')).toBeInTheDocument()
      expect(screen.getByRole('article')).toHaveClass(...SPONSORED_CLASSES)
    })

    it('keeps the composed article classes for a composed non-sponsored hit', () => {
      useRankingBadgesMock.mockReturnValue({
        ...DEFAULT_RANKING_BADGES,
        isComposed: true,
        composedLabel: 'Popular',
      })
      renderGrocery()

      expect(SPONSORED_CLASSES).not.toHaveLength(0)
      expect(screen.getByText('• Popular')).toBeInTheDocument()
      const article = screen.getByRole('article')
      expect(article).toHaveClass(...COMPOSED_CLASSES)
      expect(article).not.toHaveClass(...SPONSORED_CLASSES)
    })
  })

  describe('sponsored hits without a sponsored article style', () => {
    it('renders the Sponsored badge and falls back to the composed article classes', () => {
      useRankingBadgesMock.mockReturnValue({
        ...DEFAULT_RANKING_BADGES,
        isComposed: true,
        isSponsored: true,
        composedLabel: 'Sponsored',
      })
      const extractor = vi.fn(
        (): EcommerceProductHitValues => {return {
          objectID: 'p1',
          productUrl: '/ecommerce/product/p1',
          name: 'Widget',
          price: 19.99,
        }},
      )

      render(
        <Hit
          variant="standard"
          item={hit}
          template={ecomTemplate}
          slug="ecommerce"
          extractor={extractor}
        />,
      )

      expect(VARIANT_CLASSES.standard.sponsoredArticle).toBeUndefined()
      expect(screen.getByText('• Sponsored')).toBeInTheDocument()
      expect(screen.getByRole('article')).toHaveClass(
        ...VARIANT_CLASSES.standard.composedArticle.split(' '),
      )
    })
  })
})
