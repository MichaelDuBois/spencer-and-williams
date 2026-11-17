import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentSearchInput } from '@/app/media-entertainment/_components/MediaEntertainmentSearchInput'

const usePathnameMock = vi.fn()
const pushMock = vi.fn()

vi.mock('next/navigation', () => {return {
  usePathname: () => usePathnameMock(),
  useRouter: () => {return { push: pushMock }},
}})

const { handleAIModeClickMock } = vi.hoisted(() => {
  return { handleAIModeClickMock: vi.fn() }
})

vi.mock('@/hooks/useSearchInput', () => {return {
  useSearchInput: () => {return {
    inputValue: '',
    inputRef: { current: null },
    handleInputChange: vi.fn(),
    handleClear: vi.fn(),
    handleFocus: vi.fn(),
    handleSubmit: vi.fn(),
    handleAIModeClick: handleAIModeClickMock,
  }},
}})

const renderAt = (pathname: string, isOverlay = false) => {
  usePathnameMock.mockReturnValue(pathname)
  return render(<MediaEntertainmentSearchInput isOverlay={isOverlay} />)
}

const getIcon = () => screen.queryByRole('button', { name: 'Search titles' })
const getField = () =>
  screen.queryByPlaceholderText('Search movies and shows...')
const getAIModeButton = () => screen.queryByRole('button', { name: /AI Mode/ })
// The single animated row: bare when collapsed, the field's shell when open.
const getRow = (container: HTMLElement) =>
  container.querySelector('form > div')!

describe('MediaEntertainmentSearchInput', () => {
  beforeEach(() => {
    usePathnameMock.mockReset()
    pushMock.mockReset()
    handleAIModeClickMock.mockReset()
  })

  it('collapses to the search icon and the AI icon on the homepage', () => {
    renderAt('/media-entertainment')

    expect(getIcon()).toBeInTheDocument()
    expect(getAIModeButton()).toBeInTheDocument()
    expect(getField()).not.toBeInTheDocument()
  })

  it('offers AI Mode on a non-search route that is not the homepage', () => {
    renderAt('/media-entertainment/my-list')

    expect(getAIModeButton()).toBeInTheDocument()
    expect(getField()).not.toBeInTheDocument()
  })

  it('shows the open field and keeps the pill on the search route', () => {
    renderAt('/media-entertainment/search')

    expect(getField()).toBeInTheDocument()
    expect(getAIModeButton()).toBeInTheDocument()
    expect(getIcon()).not.toBeInTheDocument()
  })

  it('navigates to the search route when the icon is clicked', async () => {
    renderAt('/media-entertainment')

    await userEvent.click(getIcon()!)

    expect(pushMock).toHaveBeenCalledWith('/media-entertainment/search')
  })

  it('opens the assistant from the collapsed AI icon without navigating', async () => {
    renderAt('/media-entertainment')

    await userEvent.click(getAIModeButton()!)

    expect(handleAIModeClickMock).toHaveBeenCalledTimes(1)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('opens the assistant from the pill inside the open field', async () => {
    renderAt('/media-entertainment/search')

    await userEvent.click(getAIModeButton()!)

    expect(handleAIModeClickMock).toHaveBeenCalledTimes(1)
    expect(pushMock).not.toHaveBeenCalled()
  })

  // The dark-theme treatment in globals.css hangs off this class.
  // Collapsed it is a bare glyph beside the search icon; only the open pill wants
  // the chrome the theme hook dresses.
  it('carries the theme styling hook only once the field is open', () => {
    const { unmount } = renderAt('/media-entertainment')
    expect(getAIModeButton()).not.toHaveClass('ai-mode-button')
    unmount()

    renderAt('/media-entertainment/search')
    expect(getAIModeButton()).toHaveClass('ai-mode-button')
  })

  // No capsule dresses the pair into one control — they're bare siblings.
  it('renders the collapsed controls as two separate sibling buttons', () => {
    const { container } = renderAt('/media-entertainment')
    const row = getRow(container)

    expect(row.children).toHaveLength(2)
    expect(getIcon()!.parentElement).toBe(row)
    expect(getAIModeButton()!.parentElement).toBe(row)
  })

  it('leaves the collapsed row undressed on a solid header', () => {
    const { container } = renderAt('/media-entertainment')

    expect(getRow(container)).toHaveClass('border-transparent')
    expect(getRow(container)).not.toHaveClass('bg-background')
    expect(getRow(container)).not.toHaveClass('backdrop-blur-md')
  })

  // No capsule to back the pair any more, so the row stays bare over the artwork.
  it('leaves the collapsed row undressed over the hero artwork too', () => {
    const { container } = renderAt('/media-entertainment', true)

    expect(getRow(container)).toHaveClass('border-transparent')
    expect(getRow(container)).not.toHaveClass('backdrop-blur-md')
  })

  // globals.css owns the button's background, so legibility comes from blur+shadow, not a fill.
  // The pair has to read as one set of header icons, so they share their resting
  // classes exactly — only the hover target differs, accent for the sparkle.
  it('gives the collapsed AI icon the search icon’s own treatment', () => {
    const { unmount } = renderAt('/media-entertainment', true)
    expect(getAIModeButton()).toHaveClass('text-white/90', 'drop-shadow-md')
    expect(getIcon()).toHaveClass('text-white/90', 'drop-shadow-md')
    expect(getAIModeButton()).toHaveClass('hover:text-accent')
    unmount()

    renderAt('/media-entertainment')
    expect(getAIModeButton()).toHaveClass('text-foreground/80')
    expect(getIcon()).toHaveClass('text-foreground/80')
  })

  it('dresses the shell once the field is open', () => {
    const { container, unmount } = renderAt('/media-entertainment/search')
    expect(getRow(container)).toHaveClass('bg-background', 'overflow-hidden')
    unmount()

    const overlay = renderAt('/media-entertainment/search', true)
    expect(getRow(overlay.container)).toHaveClass('backdrop-blur-md')
  })

  // Closing the bar is a width tween plus a class swap — no shared-element
  // projection, so neither icon is ever translated. The chrome has to fade with
  // the width instead of popping the instant the route changes.
  it('fades the shell chrome rather than popping it', () => {
    const { container } = renderAt('/media-entertainment/search')

    expect(getRow(container)).toHaveClass(
      'transition-[background-color,border-color,box-shadow]',
      'duration-200',
    )
  })

  // Collapsed is icon-only, named by aria-label; open is the full pill named by its text.
  it('swaps the AI control from an icon to a labelled pill', () => {
    const { unmount } = renderAt('/media-entertainment')
    expect(screen.queryByText('AI Mode')).not.toBeInTheDocument()
    expect(getAIModeButton()).toHaveAttribute('aria-label', 'AI Mode')
    expect(getAIModeButton()).toHaveClass('h-9', 'w-9')
    unmount()

    renderAt('/media-entertainment/search')
    expect(screen.getByText('AI Mode')).toBeInTheDocument()
    expect(getAIModeButton()).toHaveClass('px-2', 'text-xs')
    expect(getAIModeButton()).not.toHaveClass('w-9')
  })

  it('collapses back to the icon when leaving the search route', () => {
    const { rerender } = renderAt('/media-entertainment/search')
    expect(getField()).toBeInTheDocument()

    usePathnameMock.mockReturnValue('/media-entertainment')
    rerender(<MediaEntertainmentSearchInput isOverlay={false} />)

    expect(getIcon()).toBeInTheDocument()
    expect(getField()).not.toBeInTheDocument()
    expect(getAIModeButton()).toBeInTheDocument()
  })
})
