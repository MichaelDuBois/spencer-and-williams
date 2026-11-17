import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CompareToggle } from '@/features/chatWidget/components/CompareToggle'

const state = vi.hoisted(() => {return {
  selected: false,
  canAdd: true,
  toggle: vi.fn(),
}})
vi.mock('react-instantsearch', () => {return {
  useCompare: () => {return {
    isSelected: () => state.selected,
    canAddItems: state.canAdd,
    toggleItem: state.toggle,
  }},
}})
beforeEach(() => {
  state.selected = false
  state.canAdd = true
  state.toggle.mockClear()
})

describe('CompareToggle', () => {
  it.each([
    { name: 'Widget', expected: 'Widget' },
    { name: '', expected: 'p1' },
    { name: 42, expected: 'p1' },
  ])('labels the control for $expected', ({ name, expected }) => {
    render(
      <CompareToggle
        hit={{ objectID: 'p1', name }}
        capability={{ configurationId: 'config', minItems: 2, maxItems: 3 }}
      />,
    )
    expect(
      screen.getByRole('button', {
        name: `Compare ${expected}`,
        pressed: false,
      }),
    ).toBeEnabled()
  })

  it('disables additions at capacity but permits removal', () => {
    state.canAdd = false
    const hit = { objectID: 'p1' }
    const capability = {
      configurationId: 'config',
      minItems: 2 as const,
      maxItems: 3 as const,
    }
    const { rerender } = render(
      <CompareToggle hit={hit} capability={capability} />,
    )
    expect(screen.getByRole('button')).toBeDisabled()
    state.selected = true
    rerender(<CompareToggle hit={hit} capability={capability} />)
    fireEvent.click(screen.getByRole('button'))
    expect(state.toggle).toHaveBeenCalledWith(hit)
  })
})
