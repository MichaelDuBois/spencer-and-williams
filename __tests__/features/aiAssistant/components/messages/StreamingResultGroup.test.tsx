import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StreamingResultGroup } from '@/features/aiAssistant/components/messages/StreamingResultGroup'
import type {
  DisplayProduct,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'

const StubCard = ({ product }: { product: DisplayProduct }) => (
  <div data-testid="product-card">{product.objectID}</div>
)

const makeGroup = (count: number): PartialDisplayGroup => {
  return {
    title: 'Breakfast staples',
    why: 'Great morning picks',
    products: Array.from({ length: count }, (_, i) => {
      return { objectID: `g${i}`, why: `reason ${i}` }
    }),
  }
}

describe('StreamingResultGroup', () => {
  it('renders the title and why text', () => {
    render(<StreamingResultGroup group={makeGroup(2)} card={StubCard} />)

    expect(screen.getByText('Breakfast staples')).toBeInTheDocument()
    expect(screen.getByText('Great morning picks')).toBeInTheDocument()
  })

  it('falls back to a placeholder title while streaming', () => {
    render(
      <StreamingResultGroup
        group={{ title: null, why: null, products: [] }}
        card={StubCard}
      />,
    )

    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('renders every streamed product plus a trailing skeleton', () => {
    const { container } = render(
      <StreamingResultGroup group={makeGroup(6)} card={StubCard} />,
    )

    // No slice on the streaming path — all products are shown as they arrive.
    expect(screen.getAllByTestId('product-card')).toHaveLength(6)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('hides the trailing skeleton once the items array is complete', () => {
    const { container } = render(
      <StreamingResultGroup
        group={{ ...makeGroup(3), itemsComplete: true }}
        card={StubCard}
      />,
    )

    expect(screen.getAllByTestId('product-card')).toHaveLength(3)
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })
})
