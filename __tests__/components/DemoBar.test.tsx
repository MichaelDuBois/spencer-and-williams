import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DemoBar, type DemoBarVertical } from '@/components/DemoBar'
import {
  algoliaEnvironmentAtom,
  algoliaEnvironmentStore,
  stagingNoticeAcknowledgedAtom,
} from '@/stores/algoliaEnvironment'

const { pathnameMock } = vi.hoisted(() => {
  return { pathnameMock: vi.fn() }
})

vi.mock('next/navigation', () => {
  return { usePathname: pathnameMock }
})

const buildVertical = (slug: string, hasStaging: boolean): DemoBarVertical => {
  return {
    config: { slug, name: slug, theme: slug },
    hasStaging,
  }
}

const VERTICALS = [
  buildVertical('ecommerce', true),
  buildVertical('travel', false),
]

const openPanel = async () =>
  userEvent.click(screen.getByRole('button', { name: 'Open demo menu' }))

describe('DemoBar', () => {
  beforeEach(() => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'production')
    algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, false)
    pathnameMock.mockReturnValue('/ecommerce')
  })

  it('renders nothing on the landing page', () => {
    pathnameMock.mockReturnValue('/')
    render(<DemoBar verticals={VERTICALS} />)

    expect(
      screen.queryByRole('button', { name: 'Open demo menu' }),
    ).not.toBeInTheDocument()
  })

  it('includes the AEM demos in a separate group with external website links', async () => {
    render(<DemoBar verticals={VERTICALS} />)
    const toggle = screen.getByRole('button', { name: 'Open demo menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const section = screen.getByRole('region', {
      name: 'Adobe Experience Manager',
    })
    for (const [name, href] of [
      ['SW Cruises', 'https://sw-cruises.algolia.com/'],
      ['SW Finance', 'https://sw-financial.algolia.com/'],
      ['SW CPG', 'https://sw-cpg.algolia.com/'],
      ['SW Healthcare', 'https://sw-healthcare.algolia.com/'],
      ['SW Groceries', 'https://sw-groceries.algolia.com/'],
    ]) {
      const link = within(section).getByRole('link', {
        name: new RegExp(`^${name}`),
      })
      expect(
        within(link).getByRole('heading', { level: 3, name }),
      ).toBeInTheDocument()
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAccessibleName(/\(opens in a new tab\)$/)
    }
  })

  it('closes the menu when an AEM demo link is clicked', async () => {
    render(<DemoBar verticals={VERTICALS} />)
    const toggle = screen.getByRole('button', { name: 'Open demo menu' })
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const link = screen.getByRole('link', { name: /^SW Cruises/ })
    // jsdom does not implement navigation; keep the click in-page.
    link.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(link)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAccessibleName('Open demo menu')
  })

  it('enables the environment toggle on a vertical with a staging app', async () => {
    render(<DemoBar verticals={VERTICALS} />)
    await openPanel()

    expect(
      screen.getByRole('switch', { name: 'Use the staging Algolia app' }),
    ).toBeEnabled()
  })

  it('disables the environment toggle on a vertical without a staging app', async () => {
    pathnameMock.mockReturnValue('/travel/search/articles')
    render(<DemoBar verticals={VERTICALS} />)
    await openPanel()

    const toggle = screen.getByRole('switch', {
      name: 'Use the staging Algolia app',
    })
    expect(toggle).toBeDisabled()

    await userEvent.hover(toggle)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'No staging app for this vertical',
    )
  })

  it('keeps the toggle enabled on a staging-less vertical while staging is active', async () => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')
    pathnameMock.mockReturnValue('/travel/search/articles')
    render(<DemoBar verticals={VERTICALS} />)
    await openPanel()

    const toggle = screen.getByRole('switch', {
      name: 'Use the staging Algolia app',
    })
    expect(toggle).toBeEnabled()

    await userEvent.click(toggle)

    expect(algoliaEnvironmentStore.get(algoliaEnvironmentAtom)).toBe(
      'production',
    )
  })

  it('hides the environment toggle when no vertical has a staging app', async () => {
    render(<DemoBar verticals={[buildVertical('ecommerce', false)]} />)
    await openPanel()

    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('dismisses the staging notice before the menu on Escape', async () => {
    render(<DemoBar verticals={VERTICALS} />)
    await openPanel()

    await userEvent.click(
      screen.getByRole('switch', { name: 'Use the staging Algolia app' }),
    )
    expect(
      await screen.findByText('Switching to the staging app'),
    ).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    await waitFor(() =>
      expect(
        screen.queryByText('Switching to the staging app'),
      ).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('button', { name: 'Open demo menu' }),
    ).not.toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(
      screen.getByRole('button', { name: 'Open demo menu' }),
    ).toBeInTheDocument()
  })

  it('marks the trigger only while staging is active on a staging-capable vertical', () => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')
    const { container, unmount } = render(<DemoBar verticals={VERTICALS} />)
    expect(container.querySelector('.bg-amber-500')).toBeInTheDocument()

    unmount()
    pathnameMock.mockReturnValue('/travel')
    const withoutStaging = render(<DemoBar verticals={VERTICALS} />)
    expect(
      withoutStaging.container.querySelector('.bg-amber-500'),
    ).not.toBeInTheDocument()
  })
})
