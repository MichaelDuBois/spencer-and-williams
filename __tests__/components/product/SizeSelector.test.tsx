import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SizeSelector } from '@/components/product/SizeSelector'

describe('SizeSelector', () => {
  it('renders nothing when no sizes are provided', () => {
    const { container } = render(<SizeSelector sizes={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a button for each size', () => {
    render(<SizeSelector sizes={['S', 'M', 'L']} />)
    expect(screen.getByRole('button', { name: 'S' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'M' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'L' })).toBeInTheDocument()
  })

  it('calls onChange with the selected size on click', () => {
    const onChange = vi.fn()
    render(<SizeSelector sizes={['S', 'M']} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'M' }))
    expect(onChange).toHaveBeenCalledWith('M')
  })

  it('disables unavailable sizes and does not fire onChange', () => {
    const onChange = vi.fn()
    render(
      <SizeSelector
        sizes={['S', 'M']}
        unavailableSizes={['M']}
        onChange={onChange}
      />,
    )
    const unavailable = screen.getByRole('button', { name: 'M' })
    expect(unavailable).toBeDisabled()
    fireEvent.click(unavailable)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders the editorial variant', () => {
    const onChange = vi.fn()
    render(
      <SizeSelector sizes={['XS', 'S']} variant="editorial" onChange={onChange} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'XS' }))
    expect(onChange).toHaveBeenCalledWith('XS')
  })
})
