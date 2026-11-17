import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ColorSelector } from '@/components/product/ColorSelector'

vi.mock('next/link', () => {return {
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}})

const colors = [
  { objectID: 'C1', hex: '#000000', name: 'Black', href: '/fashion/product/C1' },
  { objectID: 'C2', hex: '#ffffff', name: 'White', href: '/fashion/product/C2' },
]

describe('ColorSelector', () => {
  it('renders nothing when there are no colors', () => {
    const { container } = render(<ColorSelector colors={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a swatch link per color with its label and href', () => {
    render(<ColorSelector colors={colors} />)
    const black = screen.getByRole('link', { name: 'Black' })
    expect(black).toHaveAttribute('href', '/fashion/product/C1')
    expect(screen.getByRole('link', { name: 'White' })).toBeInTheDocument()
  })

  it('marks the selected swatch with aria-current', () => {
    render(<ColorSelector colors={colors} selectedObjectID="C2" />)
    expect(screen.getByRole('link', { name: 'White' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('link', { name: 'Black' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
