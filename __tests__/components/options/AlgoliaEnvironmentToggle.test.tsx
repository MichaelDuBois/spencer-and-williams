import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { AlgoliaEnvironmentToggle } from '@/components/options/AlgoliaEnvironmentToggle'
import {
  algoliaEnvironmentAtom,
  algoliaEnvironmentStore,
  stagingNoticeAcknowledgedAtom,
} from '@/stores/algoliaEnvironment'

const NOTICE_HEADING = 'Switching to the staging app'

const getEnvironment = () => algoliaEnvironmentStore.get(algoliaEnvironmentAtom)

const getSwitch = () => screen.getByRole('switch')

describe('AlgoliaEnvironmentToggle', () => {
  beforeEach(() => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'production')
    algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, false)
  })

  it('renders an unchecked switch while production is active', () => {
    render(<AlgoliaEnvironmentToggle />)

    expect(getSwitch()).not.toBeChecked()
    expect(screen.getByText('Staging')).toBeInTheDocument()
  })

  it('opens the notice instead of switching on the first enable', async () => {
    render(<AlgoliaEnvironmentToggle />)

    await userEvent.click(getSwitch())

    expect(await screen.findByText(NOTICE_HEADING)).toBeInTheDocument()
    expect(getEnvironment()).toBe('production')
    expect(getSwitch()).not.toBeChecked()
  })

  it('leaves production untouched when the notice is cancelled', async () => {
    render(<AlgoliaEnvironmentToggle />)

    await userEvent.click(getSwitch())
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() =>
      expect(screen.queryByText(NOTICE_HEADING)).not.toBeInTheDocument(),
    )
    expect(getEnvironment()).toBe('production')
  })

  it('switches to staging and records the acknowledgement on confirm', async () => {
    render(<AlgoliaEnvironmentToggle />)

    await userEvent.click(getSwitch())
    await userEvent.click(
      await screen.findByRole('button', { name: 'Use staging' }),
    )

    expect(getEnvironment()).toBe('staging')
    expect(
      algoliaEnvironmentStore.get(stagingNoticeAcknowledgedAtom),
    ).toBe(true)
    await waitFor(() =>
      expect(screen.queryByText(NOTICE_HEADING)).not.toBeInTheDocument(),
    )
    expect(getSwitch()).toBeChecked()
  })

  it('flips straight to staging once the notice is acknowledged', async () => {
    algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, true)
    render(<AlgoliaEnvironmentToggle />)

    await userEvent.click(getSwitch())

    expect(getEnvironment()).toBe('staging')
    expect(screen.queryByText(NOTICE_HEADING)).not.toBeInTheDocument()
  })

  it('never shows the notice when switching back to production', async () => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')
    algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, true)
    render(<AlgoliaEnvironmentToggle />)

    await userEvent.click(getSwitch())

    expect(getEnvironment()).toBe('production')
    expect(screen.queryByText(NOTICE_HEADING)).not.toBeInTheDocument()
  })

  it('does not flip the store or open the notice while disabled', async () => {
    render(<AlgoliaEnvironmentToggle disabled />)

    const toggle = getSwitch()
    expect(toggle).toBeDisabled()

    await userEvent.click(toggle)

    expect(getEnvironment()).toBe('production')
    expect(screen.queryByText(NOTICE_HEADING)).not.toBeInTheDocument()
  })

  it('shows the standing caveat and re-opens the notice while staging is live', async () => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')
    algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, true)
    render(<AlgoliaEnvironmentToggle />)

    expect(
      screen.getByText(/Shared app · resets in \d+h?\s?\d*m?/),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Why staging is risky' }),
    )

    expect(await screen.findByText(NOTICE_HEADING)).toBeInTheDocument()
    expect(getEnvironment()).toBe('staging')
  })

  it('explains why a disabled toggle is unavailable', async () => {
    render(
      <AlgoliaEnvironmentToggle
        disabled
        disabledTooltip="No staging app for this vertical"
      />,
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await userEvent.hover(getSwitch())

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'No staging app for this vertical',
    )
  })

  it('does not render a tooltip while the toggle is enabled', async () => {
    render(
      <AlgoliaEnvironmentToggle disabledTooltip="No staging app for this vertical" />,
    )

    await userEvent.hover(getSwitch())

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
