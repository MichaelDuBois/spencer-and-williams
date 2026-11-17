import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { CurrentRefinements } from '@/components/filters/CurrentRefinements'
import type { FacetConfig } from '@/types'

const facets: FacetConfig[] = [
  {
    attribute: 'visible_by',
    label: 'Visible by',
    type: 'refinement',
    valueLabels: { customer_group_1: 'Customer Group 1' },
  },
]

vi.mock('react-instantsearch', () => {
  return {
    useCurrentRefinements: () => {
      return {
        items: [
          {
            attribute: 'visible_by',
            label: 'visible_by',
            refinements: [
              { value: 'CUSTOMER_GROUP_1', label: 'CUSTOMER_GROUP_1' },
            ],
          },
        ],
        refine: vi.fn(),
      }
    },
  }
})

it('uses customer group names in visibility refinement chips', () => {
  render(<CurrentRefinements facets={facets} />)

  expect(screen.getByText('Visible by:')).toBeVisible()
  expect(screen.getByText('Customer Group 1')).toBeVisible()
  expect(screen.queryByText('CUSTOMER_GROUP_1')).not.toBeInTheDocument()
})
