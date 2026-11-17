import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DemoOptionToggle } from '@/components/options/DemoOptionToggle'

const baseProps = {
  label: 'Distinct',
  description: 'One result per product instead of per variant',
  checked: false,
  onCheckedChange: vi.fn(),
}

describe('DemoOptionToggle', () => {
  it('renders an interactive switch by default', async () => {
    const onCheckedChange = vi.fn()
    render(<DemoOptionToggle {...baseProps} onCheckedChange={onCheckedChange} />)

    const toggle = screen.getByRole('switch')
    expect(toggle).toBeEnabled()

    await userEvent.click(toggle)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('disables the switch when disabled', async () => {
    const onCheckedChange = vi.fn()
    render(
      <DemoOptionToggle
        {...baseProps}
        disabled
        onCheckedChange={onCheckedChange}
      />,
    )

    const toggle = screen.getByRole('switch')
    expect(toggle).toBeDisabled()

    await userEvent.click(toggle)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('shows the tooltip explaining why a disabled toggle is unavailable', async () => {
    render(
      <DemoOptionToggle
        {...baseProps}
        disabled
        disabledTooltip="Distinct cannot be enabled with Composition API"
      />,
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await userEvent.hover(screen.getByRole('switch'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Distinct cannot be enabled with Composition API',
    )
  })

  it('does not render a tooltip while the toggle is enabled', async () => {
    render(
      <DemoOptionToggle
        {...baseProps}
        disabledTooltip="Distinct cannot be enabled with Composition API"
      />,
    )

    await userEvent.hover(screen.getByRole('switch'))

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
