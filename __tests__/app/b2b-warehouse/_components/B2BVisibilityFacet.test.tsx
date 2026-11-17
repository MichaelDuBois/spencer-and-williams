import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

import { B2BVisibilityFacet } from '@/app/b2b-warehouse/_components/B2BVisibilityFacet'

const refine = vi.fn()
const clearVisibility = vi.fn()
const state = {
  items: [] as { value: string; isRefined: boolean }[],
  canClear: false,
}

vi.mock('react-instantsearch', () => {
  return {
    useRefinementList: () => {
      return { items: state.items, refine }
    },
    useClearRefinements: () => {
      return { canRefine: state.canClear, refine: clearVisibility }
    },
  }
})

beforeEach(() => {
  state.items = []
  state.canClear = false
  refine.mockClear()
  clearVisibility.mockClear()
})

it('lets a visitor filter by customer group without selecting a persona', async () => {
  render(<B2BVisibilityFacet groupId={null} />)

  expect(screen.getByRole('group', { name: 'Visible by' })).toBeVisible()
  expect(
    screen.getByText('Filter products by group. Choose a persona to apply its pricing.'),
  ).toBeVisible()
  expect(screen.queryByText(/group discount/)).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('checkbox', { name: 'Customer Group 0' }))

  expect(refine).toHaveBeenCalledWith('customer_group_0')
  expect(screen.getByRole('checkbox', { name: 'Customer Group 1' })).toBeEnabled()
  expect(screen.queryByText(/group discount/)).not.toBeInTheDocument()
})

it('toggles the indexed value when its case differs from the group ID', async () => {
  state.items = [{ value: 'CUSTOMER_GROUP_0', isRefined: true }]
  render(<B2BVisibilityFacet groupId={null} />)

  await userEvent.click(screen.getByRole('checkbox', { name: 'Customer Group 0' }))

  expect(refine).toHaveBeenCalledWith('CUSTOMER_GROUP_0')
})

it('bolds a selected customer group', () => {
  state.items = [{ value: 'customer_group_0', isRefined: true }]
  render(<B2BVisibilityFacet groupId={null} />)

  expect(
    screen.getByRole('checkbox', { name: 'Customer Group 0' }).closest('label'),
  ).toHaveClass('font-medium')
  expect(
    screen.getByRole('checkbox', { name: 'Customer Group 0' })
      .nextElementSibling,
  ).toHaveClass('bg-accent')
  expect(
    screen.getByRole('checkbox', { name: 'Customer Group 0' })
      .nextElementSibling,
  ).toHaveClass('rounded-input')
  expect(screen.queryByText('customer_group_0')).not.toBeInTheDocument()
  expect(screen.queryByText(/group discount/)).not.toBeInTheDocument()
  expect(
    screen.getByRole('checkbox', { name: 'Customer Group 1' }).closest('label'),
  ).not.toHaveClass('font-medium')
})

it('keeps the persona group selected and locked after an ordinary refinement is cleared', () => {
  state.items = [
    { value: 'customer_group_0', isRefined: true },
    { value: 'customer_group_1', isRefined: true },
  ]
  state.canClear = true
  const { rerender } = render(<B2BVisibilityFacet groupId="customer_group_0" />)

  expect(clearVisibility).toHaveBeenCalledTimes(1)
  expect(refine).not.toHaveBeenCalled()
  expect(screen.getByRole('checkbox', { name: /Customer Group 0/ })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: /Customer Group 0/ })).toBeDisabled()
  expect(
    screen.getByRole('checkbox', { name: /Customer Group 0/ })
      .nextElementSibling,
  ).toHaveClass('bg-muted-foreground')
  expect(
    screen.getByRole('checkbox', { name: /Customer Group 0/ }).closest('label'),
  ).toHaveClass('font-medium')
  expect(screen.getByRole('checkbox', { name: 'Customer Group 1' })).toBeDisabled()
  expect(screen.getByText('15% group discount')).toBeVisible()
  expect(screen.queryByText('30% group discount')).not.toBeInTheDocument()
  expect(screen.getByText('Change persona to clear this group.')).toHaveClass(
    'text-micro',
  )
  expect(screen.queryByText('customer_group_0')).not.toBeInTheDocument()

  state.items = [{ value: 'customer_group_1', isRefined: true }]
  rerender(<B2BVisibilityFacet groupId="customer_group_0" />)
  expect(clearVisibility).toHaveBeenCalledTimes(1)

  state.items = []
  state.canClear = false
  rerender(<B2BVisibilityFacet groupId="customer_group_0" />)
  expect(screen.getByRole('checkbox', { name: /Customer Group 0/ })).toBeChecked()
  expect(clearVisibility).toHaveBeenCalledTimes(1)
})

it('shows only the selected persona discount and hides it after leaving the persona', () => {
  const { rerender } = render(<B2BVisibilityFacet groupId="customer_group_1" />)

  expect(screen.getByText('30% group discount')).toBeVisible()
  expect(screen.queryByText('15% group discount')).not.toBeInTheDocument()

  rerender(<B2BVisibilityFacet groupId={null} />)

  expect(screen.queryByText(/group discount/)).not.toBeInTheDocument()
})
