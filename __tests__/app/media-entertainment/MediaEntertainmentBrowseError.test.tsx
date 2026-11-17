import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentBrowseError } from '@/app/media-entertainment/_components/MediaEntertainmentBrowseError'

describe('MediaEntertainmentBrowseError', () => {
  it('gives the failed page a heading instead of a stuck skeleton', () => {
    render(<MediaEntertainmentBrowseError onRetry={vi.fn()} />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('retries on demand', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<MediaEntertainmentBrowseError onRetry={onRetry} />)

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
