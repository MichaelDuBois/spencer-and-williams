import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import type { EcommerceHitTemplate } from '@/app/ecommerce/types'
import type { FashionProductHitValues } from '@/app/fashion/hitValues.types'
import type { FashionHitTemplate } from '@/app/fashion/types'
import { ProductAutocompleteHit } from '@/components/autocomplete/hits/ProductAutocompleteHit'

vi.mock('react-instantsearch', () => {return {
  Highlight: ({ attribute }: { attribute: string }) => (
    <span data-testid="highlight" data-attribute={attribute} />
  ),
}})

vi.mock('@/hooks/useInsightsEvents', () => {return {
  useInsightsEvents: () => {return { sendProductClickEvent: vi.fn() }},
}})

vi.mock('@/hooks/useRankingBadges', () => {return {
  useRankingBadges: () => {return { isComposed: false, isPersonalized: false }},
}})

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

describe('ProductAutocompleteHit', () => {
  it('renders ecom values including brand • category separator', () => {
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
      <ProductAutocompleteHit
        item={{ objectID: 'p1' }}
        template={ecomTemplate}
        slug="ecommerce"
        extractor={extractor}
        onSelect={() => {}}
      />,
    )

    expect(extractor).toHaveBeenCalledWith({ objectID: 'p1' }, ecomTemplate, 'ecommerce')
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('•')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('$19.99')).toBeInTheDocument()
    expect(container.querySelector('img[src="https://cdn/img.jpg"]')).toBeInTheDocument()
  })

  it('renders fashion values without category and without separator', () => {
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
      <ProductAutocompleteHit
        item={{ objectID: 'f1' }}
        template={fashionTemplate}
        slug="fashion"
        extractor={extractor}
        onSelect={() => {}}
      />,
    )

    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.queryByText('•')).not.toBeInTheDocument()
    expect(screen.getByText('$49')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('omits the price node when price is undefined', () => {
    const extractor = vi.fn(
      (): EcommerceProductHitValues => {return {
        objectID: 'p2',
        productUrl: '/ecommerce/product/p2',
        name: 'No-price item',
      }},
    )

    render(
      <ProductAutocompleteHit
        item={{ objectID: 'p2' }}
        template={ecomTemplate}
        slug="ecommerce"
        extractor={extractor}
        onSelect={() => {}}
      />,
    )

    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })

  it('renders a highlighted SKU when requested', () => {
    const extractor = (): B2BWarehouseProductHitValues => {return {
      objectID: 'p4',
      productUrl: '/b2b-warehouse/product/p4',
      name: 'Warehouse Widget',
      sku: 'WW-123',
    }}

    render(
      <ProductAutocompleteHit
        item={{ objectID: 'p4' }}
        template={ecomTemplate}
        slug="b2b-warehouse"
        extractor={extractor}
        onSelect={() => {}}
        skuAttribute="product.sku"
      />,
    )

    expect(screen.getByText('SKU:')).toBeInTheDocument()
    expect(screen.getAllByTestId('highlight')).toHaveLength(2)
    expect(screen.getAllByTestId('highlight')[1]).toHaveAttribute(
      'data-attribute',
      'product.sku',
    )
  })

  it('does not render the SKU when no SKU attribute is provided', () => {
    const extractor = (): B2BWarehouseProductHitValues => {return {
      objectID: 'p4',
      productUrl: '/b2b-warehouse/product/p4',
      name: 'Warehouse Widget',
      sku: 'WW-123',
    }}

    render(
      <ProductAutocompleteHit
        item={{ objectID: 'p4' }}
        template={ecomTemplate}
        slug="ecommerce"
        extractor={extractor}
        onSelect={() => {}}
      />,
    )

    expect(screen.queryByText('SKU:')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('highlight')).toHaveLength(1)
  })

  it('fires onSelect when clicked', async () => {
    const onSelect = vi.fn()
    const extractor = (): EcommerceProductHitValues => {return {
      objectID: 'p3',
      productUrl: '/ecommerce/product/p3',
      name: 'Click me',
    }}

    render(
      <ProductAutocompleteHit
        item={{ objectID: 'p3' }}
        template={ecomTemplate}
        slug="ecommerce"
        extractor={extractor}
        onSelect={onSelect}
      />,
    )

    screen.getByRole('button').click()
    expect(onSelect).toHaveBeenCalledOnce()
  })
})
