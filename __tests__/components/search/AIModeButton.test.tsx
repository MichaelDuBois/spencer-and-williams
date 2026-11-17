import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AIModeButton } from '@/components/search/AIModeButton'

const getButton = () => screen.getByRole('button', { name: /AI Mode/ })
const getGlyph = () => getButton().querySelector('svg')

describe('AIModeButton', () => {
  it('renders a labelled button that reports clicks', async () => {
    const onClick = vi.fn()
    render(<AIModeButton onClick={onClick} />)

    await userEvent.click(getButton())

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // The other verticals render the pill through SearchInputFields and rely on
  // the visible label, so the default must stay labelled.
  it('shows the label by default', () => {
    render(<AIModeButton onClick={vi.fn()} />)

    expect(screen.getByText('AI Mode')).toBeInTheDocument()
    // The text is the button's name, so an aria-label would only duplicate it.
    expect(getButton()).not.toHaveAttribute('aria-label')
  })

  // The per-theme refinements in globals.css hang off this class.
  it('keeps the styling hook the themes target', () => {
    render(<AIModeButton onClick={vi.fn()} />)

    expect(getButton()).toHaveClass('ai-mode-button')
  })

  it('defaults to the sm size and honours the size prop', () => {
    const { unmount } = render(<AIModeButton onClick={vi.fn()} />)
    expect(getButton()).toHaveClass('px-3', 'text-sm')
    unmount()

    render(<AIModeButton onClick={vi.fn()} size="xs" />)
    expect(getButton()).toHaveClass('px-2', 'text-xs')
  })

  // Inside the pill the sparkle is the accent, which is what makes it read as an
  // AI affordance rather than one more header glyph.
  it('paints the pill’s sparkle with the accent', () => {
    render(<AIModeButton onClick={vi.fn()} />)

    expect(getGlyph()).toHaveClass('text-accent')
  })

  it('merges a caller className over its own utilities', () => {
    render(<AIModeButton onClick={vi.fn()} className="mr-1.5" />)

    expect(getButton()).toHaveClass('mr-1.5')
  })

  describe('icon-only', () => {
    it('drops the text but keeps an accessible name', () => {
      render(<AIModeButton onClick={vi.fn()} showLabel={false} />)

      expect(screen.queryByText('AI Mode')).not.toBeInTheDocument()
      expect(getButton()).toHaveAttribute('aria-label', 'AI Mode')
    })

    // Unlike the pill's accent sparkle, this one has to match the plain header
    // icons beside it, so it takes the colour the caller puts on the button.
    it('leaves the glyph to inherit the button’s colour', () => {
      render(<AIModeButton onClick={vi.fn()} showLabel={false} />)

      expect(getGlyph()).not.toHaveClass('text-accent')
    })

    // It has to match the 36px footprint of the search icon button beside it.
    it('collapses to a 36px circle instead of the sized pill', () => {
      render(<AIModeButton onClick={vi.fn()} showLabel={false} />)

      expect(getButton()).toHaveClass('h-9', 'w-9', 'rounded-full')
      expect(getButton()).not.toHaveClass('px-3')
    })

    // A bare header glyph, not a pill: it sits beside other icon buttons and has
    // to match them, so it drops the chrome and lets the caller own its colour.
    it('drops the pill chrome the labelled variant carries', () => {
      render(<AIModeButton onClick={vi.fn()} showLabel={false} />)

      expect(getButton()).not.toHaveClass('ai-mode-button')
      expect(getButton()).not.toHaveClass('border')
      expect(getButton()).not.toHaveClass('hover:bg-accent')
    })

    it('reports clicks', async () => {
      const onClick = vi.fn()
      render(<AIModeButton onClick={onClick} showLabel={false} />)

      await userEvent.click(getButton())

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })
})
