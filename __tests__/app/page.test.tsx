import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import LandingPage from '@/app/page'
import { verticals } from '@/verticals'
import { AEM_DEMOS, AEM_DEMOS_HEADING } from '@/verticals/aem-demos'

describe('LandingPage', () => {
  it('expands only the selected card and leaves neighbouring cards collapsed', async () => {
    const user = userEvent.setup()
    render(<LandingPage />)
    const triggers = screen.getAllByRole('button', { name: /^Features & info/ })
    const selected = triggers[0]

    await user.click(selected)
    expect(selected).toHaveAttribute('aria-expanded', 'true')
    for (const trigger of triggers.slice(1)) {
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    }

    const aemTrigger = screen.getByRole('button', {
      name: 'Features & info for SW Cruises',
    })
    await user.click(aemTrigger)
    expect(aemTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(selected).toHaveAttribute('aria-expanded', 'true')
    await user.click(selected)
    expect(selected).toHaveAttribute('aria-expanded', 'false')
    expect(aemTrigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('gives every demo an independent, initially collapsed feature list', () => {
    render(<LandingPage />)
    const triggers = screen.getAllByRole('button', { name: /^Features & info/ })
    expect(triggers).toHaveLength(verticals.length + AEM_DEMOS.length)
    const contentIds = triggers.map((trigger) =>
      trigger.getAttribute('aria-controls'),
    )
    expect(new Set(contentIds).size).toBe(triggers.length)

    for (const trigger of triggers) {
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      const contentId = trigger.getAttribute('aria-controls')
      const content = contentId ? document.getElementById(contentId) : null
      if (!content) throw new Error('Accordion content missing')
      expect(content).not.toBeVisible()
      expect(
        within(content).getAllByRole('listitem', { hidden: true }).length,
      ).toBeGreaterThan(0)
    }
  })

  it('links to internal documentation in new tabs from the footer', () => {
    render(<LandingPage />)

    const navigation = screen.getByRole('navigation', { name: 'Documentation' })
    expect(within(navigation).getByText('Algolia internal')).toBeInTheDocument()

    for (const [name, href] of [
      [
        /^S&W demos/,
        'https://algolia.atlassian.net/wiki/spaces/DE/pages/7329284233/Spencer+Williams+Documentation',
      ],
      [
        /^AEM demos/,
        'https://docs.google.com/document/d/1BIU4mcKTj-zuPCeoWphP_JGiCqSI36zGVZA9dbfNdwA/edit?tab=t.0#heading=h.hw5ohwjx8llp',
      ],
    ] as const) {
      const link = within(navigation).getByRole('link', { name })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAccessibleName(/\(opens in a new tab\)$/)
    }
  })

  it('renders every AEM demo in its own section', () => {
    render(<LandingPage />)

    const section = screen.getByRole('region', { name: AEM_DEMOS_HEADING })
    const links = within(section).getAllByRole('link')

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://sw-cruises.algolia.com/',
      'https://sw-financial.algolia.com/',
      'https://sw-cpg.algolia.com/',
      'https://sw-healthcare.algolia.com/',
      'https://sw-groceries.algolia.com/',
    ])
  })

  it('keeps all registered vertical links on the landing page', () => {
    render(<LandingPage />)

    for (const { config } of verticals) {
      expect(
        screen.getByText(`Explore ${config.name}`).closest('a'),
      ).toHaveAttribute('href', `/${config.slug}`)
    }
  })
})
