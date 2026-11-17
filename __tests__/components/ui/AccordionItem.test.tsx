import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { AccordionItem } from '@/components/ui/AccordionItem'

describe('AccordionItem', () => {
  it('connects the trigger to an inaccessible, inert panel while collapsed', () => {
    render(
      <AccordionItem title="Details">
        <a href="/details">Read details</a>
      </AccordionItem>,
    )
    const trigger = screen.getByRole('button', { name: 'Details' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    const contentId = trigger.getAttribute('aria-controls')
    const panel = contentId ? document.getElementById(contentId) : null
    expect(panel).toHaveAttribute('aria-hidden', 'true')
    expect(panel).toHaveAttribute('inert')
    expect(
      screen.queryByRole('link', { name: 'Read details' }),
    ).not.toBeInTheDocument()
  })

  it('supports keyboard expansion and collapse with the landing variant', async () => {
    const user = userEvent.setup()
    render(
      <AccordionItem title="Features & info" variant="landing">
        <p>AI features</p>
      </AccordionItem>,
    )
    const trigger = screen.getByRole('button', { name: 'Features & info' })
    await user.tab()
    expect(trigger).toHaveFocus()
    await user.keyboard(' ')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(screen.getByText('AI features')).toBeVisible())
    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() =>
      expect(screen.getByText('AI features')).not.toBeVisible(),
    )
  })

  it('preserves defaultOpen and gives each accordion its own panel ID', () => {
    render(
      <>
        <AccordionItem title="Description" defaultOpen>
          Product details
        </AccordionItem>
        <AccordionItem title="Specifications">Technical details</AccordionItem>
      </>,
    )
    const openTrigger = screen.getByRole('button', { name: 'Description' })
    const closedTrigger = screen.getByRole('button', { name: 'Specifications' })
    expect(openTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Product details')).toBeVisible()
    expect(openTrigger.getAttribute('aria-controls')).not.toBe(
      closedTrigger.getAttribute('aria-controls'),
    )
  })
})
