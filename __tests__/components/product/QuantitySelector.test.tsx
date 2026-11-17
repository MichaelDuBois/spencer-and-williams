import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { QuantitySelector } from '@/components/product/QuantitySelector'

describe('QuantitySelector', () => {
  it('renders the current value', () => {
    render(<QuantitySelector value={3} onChange={vi.fn()} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('increments on the increase button', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={2} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('decrements on the decrease button', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={2} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('disables the decrease button at the minimum', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={1} onChange={onChange} />)
    const decrease = screen.getByRole('button', { name: 'Decrease quantity' })
    expect(decrease).toBeDisabled()
    fireEvent.click(decrease)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('respects a custom min', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={2} onChange={onChange} min={2} />)
    expect(
      screen.getByRole('button', { name: 'Decrease quantity' }),
    ).toBeDisabled()
  })

  it('disables the increase button and clamps at max', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={5} onChange={onChange} max={5} />)
    const increase = screen.getByRole('button', { name: 'Increase quantity' })
    expect(increase).toBeDisabled()
    fireEvent.click(increase)
    expect(onChange).not.toHaveBeenCalled()
  })
})
