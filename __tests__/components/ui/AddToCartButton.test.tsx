import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AddToCartButton } from '@/components/ui/button/AddToCartButton'

afterEach(() => {
  vi.useRealTimers()
})

describe('AddToCartButton', () => {
  it('calls onAdd on click (animated, the default)', () => {
    const onAdd = vi.fn()
    render(<AddToCartButton onAdd={onAdd} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('ignores a second click while in the added state', () => {
    const onAdd = vi.fn()
    render(<AddToCartButton onAdd={onAdd} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('reverts to the default label after the added duration (non-animated)', () => {
    vi.useFakeTimers()
    const onAdd = vi.fn()
    render(<AddToCartButton onAdd={onAdd} animated={false} />)
    const button = screen.getByRole('button')

    fireEvent.click(button)
    expect(screen.getByText('Added!')).toBeInTheDocument()
    expect(button).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('renders a custom label and hides the icon label text via showIcon', () => {
    render(<AddToCartButton onAdd={vi.fn()} animated={false} label="Buy now" />)
    expect(screen.getByText('Buy now')).toBeInTheDocument()
  })

  it('renders the compact variant and still triggers onAdd', () => {
    const onAdd = vi.fn()
    render(<AddToCartButton onAdd={onAdd} compact />)
    fireEvent.click(screen.getByRole('button'))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })
})

it('waits for validation before confirming an addition', async () => {
  const pending = Promise.withResolvers<void>()
  const onAdd = vi.fn(() => pending.promise)
  render(<AddToCartButton animated={false} onAdd={onAdd} />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByRole('button')).toBeDisabled()
  expect(screen.getByText('Checking…')).toBeInTheDocument()
  expect(screen.queryByText('Added!')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button'))
  expect(onAdd).toHaveBeenCalledOnce()
  await act(async () => pending.resolve())
  expect(screen.getByText('Added!')).toBeInTheDocument()
})

it('shows a failed validation and lets the user retry', async () => {
  const onAdd = vi
    .fn()
    .mockRejectedValueOnce(new Error('Unable to check availability'))
    .mockResolvedValue(undefined)
  render(<AddToCartButton animated={false} onAdd={onAdd} />)
  await act(async () => fireEvent.click(screen.getByRole('button')))
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Unable to check availability',
  )
  expect(screen.getByRole('button')).not.toBeDisabled()
  expect(screen.queryByText('Added!')).not.toBeInTheDocument()
  await act(async () => fireEvent.click(screen.getByRole('button')))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByText('Added!')).toBeInTheDocument()
})
