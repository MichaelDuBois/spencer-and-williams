import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CarouselResultGroup } from '@/features/aiAssistant/components/messages/CarouselResultGroup'
import type { DisplayGroup, DisplayProduct } from '@/features/aiAssistant/types'

const StubCard = ({ product }: { product: DisplayProduct }) => (
  <div data-testid="product-card">{product.objectID}</div>
)

const makeGroup = (count: number): DisplayGroup => {
  return {
    title: 'Breakfast staples',
    why: 'Great morning picks',
    products: Array.from({ length: count }, (_, i) => {
      return {
        objectID: `g${i}`,
        why: `reason ${i}`,
      }
    }),
  }
}

describe('CarouselResultGroup', () => {
  it('renders the group title and why text', () => {
    render(<CarouselResultGroup group={makeGroup(2)} card={StubCard} />)

    expect(screen.getByText('Breakfast staples')).toBeInTheDocument()
    expect(screen.getByText('Great morning picks')).toBeInTheDocument()
  })

  it('renders at most four product cards', () => {
    const { container } = render(
      <CarouselResultGroup group={makeGroup(6)} card={StubCard} />,
    )

    expect(screen.getAllByTestId('product-card')).toHaveLength(4)
    expect(container.querySelector('.items-stretch')).toBeInTheDocument()
  })

  it('renders the "See more like this" button anchored on the group title', () => {
    render(
      <CarouselResultGroup
        group={makeGroup(2)}
        card={StubCard}
        query="fresh fruit"
      />,
    )

    expect(
      screen.getByRole('button', { name: /see more like this/i }),
    ).toBeInTheDocument()
  })
})
