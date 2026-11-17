import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { LandingCardFeatures } from '@/components/landing/LandingCardFeatures'

describe('LandingCardFeatures', () => {
  it('renders nothing when there are no features or ownership details', () => {
    const { container } = render(
      <LandingCardFeatures name="Demo" features={[]} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('can disclose ownership without rendering an empty feature list', async () => {
    const user = userEvent.setup()
    render(
      <LandingCardFeatures
        name="Demo"
        features={[]}
        ownership="Maintained by another team"
      />,
    )
    await user.click(screen.getByRole('button', { name: /Features & info/ }))
    await waitFor(() =>
      expect(screen.getByText('Maintained by another team')).toBeVisible(),
    )
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
