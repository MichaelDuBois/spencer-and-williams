import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { B2BHit } from '@/app/b2b-warehouse/_components/B2BHit'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import type { B2BWarehouseHitTemplate } from '@/app/b2b-warehouse/types'

import type { ReactNode } from 'react'

vi.mock('@/app/b2b-warehouse/_hooks/useB2BPrepareCartProduct', () => {return {
  useB2BPrepareCartProduct: () => vi.fn(),
}})

vi.mock('@/components/hit/Hit', () => {return {
  Hit: ({
    renderDetails,
  }: {
    renderDetails?: (
      values: { sku?: string },
      renderHighlight: (attribute: string) => ReactNode,
    ) => ReactNode
  }) => (
    <div>
      {renderDetails?.({ sku: 'WW-123' }, (attribute) => (
        <span data-testid="highlight" data-attribute={attribute} />
      ))}
    </div>
  ),
}})

const nestedSkuTemplate: B2BWarehouseHitTemplate = {
  attributes: {
    name: 'name',
    sku: 'product.sku',
    image: 'image',
    price: 'price',
    brand: 'brand',
    description: 'description',
    category: 'category',
    hierarchicalCategories: 'hierarchicalCategories',
    info: 'info',
    rating: 'reviews.rating',
    reviewsCount: 'reviews.count',
    availableInStores: 'availableInStores',
  },
}

describe('B2BHit', () => {
  it('highlights the SKU using the configured template path', () => {
    render(
      <B2BHit
        variant="b2b-warehouse"
        item={{ objectID: 'b2b-1' }}
        template={nestedSkuTemplate}
        slug="b2b-warehouse"
        extractor={getB2BWarehouseProductHitValues}
      />,
    )

    expect(screen.getByText('SKU:')).toBeInTheDocument()
    expect(screen.getByTestId('highlight')).toHaveAttribute(
      'data-attribute',
      'product.sku',
    )
  })

})
