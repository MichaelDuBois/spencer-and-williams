import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OutdatedBadge } from '@/components/badge/OutdatedBadge'

describe('OutdatedBadge', () => {
  it('renders the Outdated label', () => {
    render(<OutdatedBadge />)

    expect(screen.getByText('Outdated')).toBeInTheDocument()
  })

  it('uses the themed warning tokens rather than a fixed palette colour', () => {
    render(<OutdatedBadge />)
    const badge = screen.getByText('Outdated')

    expect(badge).toHaveClass('bg-warning/10', 'text-warning')
    expect(badge.className).not.toMatch(/amber/)
  })

  it('renders at the default size unless told otherwise', () => {
    render(<OutdatedBadge />)

    expect(screen.getByText('Outdated')).toHaveClass('text-xs', 'px-2')
  })

  it('renders a tighter badge at the compact size', () => {
    render(<OutdatedBadge size="compact" />)
    const badge = screen.getByText('Outdated')

    expect(badge).toHaveClass('text-micro', 'px-1.5')
    expect(badge).not.toHaveClass('text-xs')
  })

  it('merges a caller-supplied className', () => {
    render(<OutdatedBadge className="shrink-0" />)

    expect(screen.getByText('Outdated')).toHaveClass('shrink-0')
  })
})
