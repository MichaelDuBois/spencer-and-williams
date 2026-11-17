import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StarRating } from '@/components/ui/StarRating'

const filledStars = (container: HTMLElement) =>
  container.querySelectorAll('.fill-yellow-400').length

describe('StarRating', () => {
  it('renders the rating value and review count by default', () => {
    render(<StarRating rating={4.8} count={342} />)
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('(342 reviews)')).toBeInTheDocument()
  })

  it('rounds fractional ratings to fill the nearest number of stars', () => {
    const { container } = render(<StarRating rating={3.5} />)
    expect(filledStars(container)).toBe(4)
  })

  it('fills no stars at rating 0 and all five at rating 5', () => {
    const { container: zero } = render(<StarRating rating={0} />)
    expect(filledStars(zero)).toBe(0)

    const { container: five } = render(<StarRating rating={5} />)
    expect(filledStars(five)).toBe(5)
  })

  it('hides the review count when showCount is false', () => {
    render(<StarRating rating={4} count={10} showCount={false} />)
    expect(screen.queryByText('(10 reviews)')).not.toBeInTheDocument()
  })

  it('renders the compact format with inline count', () => {
    render(<StarRating rating={4.2} count={88} compact />)
    expect(screen.getByText('4.2 (88)')).toBeInTheDocument()
  })
})
