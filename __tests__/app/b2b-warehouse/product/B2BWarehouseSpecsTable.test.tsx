import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { B2BWarehouseSpecsTable } from '@/app/b2b-warehouse/product/[id]/_components/B2BWarehouseSpecsTable'

describe('B2BWarehouseSpecsTable', () => {
  it('renders a row per spec with label and value', () => {
    render(
      <B2BWarehouseSpecsTable
        rows={[
          { label: 'Length', value: '12 in' },
          { label: 'Shape', value: 'Flat' },
        ]}
      />,
    )
    expect(screen.getByText('Length')).toBeInTheDocument()
    expect(screen.getByText('12 in')).toBeInTheDocument()
    expect(screen.getByText('Shape')).toBeInTheDocument()
    expect(screen.getByText('Flat')).toBeInTheDocument()
  })
})
