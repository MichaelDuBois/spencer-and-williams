import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Ship } from 'lucide-react'
import { describe, it, expect } from 'vitest'

import {
  AemDemoCard,
  LandingHero,
  VerticalCard,
} from '@/components/landing/Landing'
import { LandingHeader } from '@/components/landing/LandingHeader'
import type { Vertical } from '@/types'
import type { AemDemo } from '@/verticals/aem-demos'

describe('LandingHeader', () => {
  it('renders the site name', () => {
    render(<LandingHeader />)
    expect(screen.getByText('Spencer & Williams')).toBeInTheDocument()
  })

  it('renders the Algolia attribution', () => {
    render(<LandingHeader />)
    expect(screen.getByText('Powered by')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Algolia' })).toBeInTheDocument()
  })

  it('renders the environment toggle while a vertical declares a staging app', () => {
    render(<LandingHeader />)
    expect(
      screen.getByRole('switch', { name: 'Use the staging Algolia app' }),
    ).toBeInTheDocument()
  })
})

describe('LandingHero', () => {
  it('renders the main heading', () => {
    render(<LandingHero />)
    expect(screen.getByText('Choose Your Demo Experience')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<LandingHero />)
    expect(
      screen.getByText(
        'Select a vertical to explore its unique design and features',
      ),
    ).toBeInTheDocument()
  })
})

describe('VerticalCard', () => {
  const mockVertical: Vertical = {
    config: {
      slug: 'ecommerce',
      name: 'E-commerce',
      description: 'Shop the latest trends',
      assets: {
        favicon: '/ecommerce/favicon.ico',
        logo: '/ecommerce/logo.svg',
        banner: '/ecommerce/banner.jpg',
      },
      theme: 'ecommerce',
      navigation: [],
      algolia: {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        primaryIndex: {
          name: 'test-products-index',
          template: {
            nameAttribute: 'name',
            imageAttribute: 'image',
            imageHrefPrefix: '',
            priceAttribute: 'price',
            brandAttribute: 'brand',
          },
          facets: [],
        },
        indices: {
          querySuggestions: {
            name: 'test-query-suggestions-index',
            facets: [],
          },
          aiSuggestions: {
            name: 'test-ai-suggestions-index',
            facets: [],
          },
        },
      },
      features: {
        agentStudio: {
          filterSuggestionsAgentID: 'test-filter-suggestions-agent-id',
          shoppingAssistantAgentID: 'test-shopping-assistant-agent-id',
        },
      },
    },
  }

  it('renders the vertical name', () => {
    render(<VerticalCard index={0} {...mockVertical} />)
    expect(screen.getByText('E-commerce')).toBeInTheDocument()
  })

  it('renders the vertical description', () => {
    render(<VerticalCard index={0} {...mockVertical} />)
    expect(screen.getByText('Shop the latest trends')).toBeInTheDocument()
  })

  it('renders the explore link with correct href', () => {
    render(<VerticalCard index={0} {...mockVertical} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/ecommerce')
  })

  it('renders the explore text', () => {
    render(<VerticalCard index={0} {...mockVertical} />)
    expect(screen.getByText('Explore E-commerce')).toBeInTheDocument()
  })

  it('expands and collapses features with the keyboard without following the demo link', async () => {
    const user = userEvent.setup()
    render(<VerticalCard index={0} {...mockVertical} />)
    const trigger = screen.getByRole('button', { name: /Features & info/ })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('AI assistant (Agent Studio)')).not.toBeVisible()
    expect(screen.getByRole('link')).not.toContainElement(trigger)

    await user.tab()
    await user.tab()
    expect(trigger).toHaveFocus()
    await user.keyboard(' ')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() =>
      expect(screen.getByText('AI assistant (Agent Studio)')).toBeVisible(),
    )

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/ecommerce')
  })
})

describe('AemDemoCard', () => {
  const mockDemo: AemDemo = {
    name: 'Test Cruises',
    href: 'https://example.com/cruises',
    description: 'Sail through a test catalog',
    icon: Ship,
    accentColor: 'var(--theme-accent-test)',
    features: ['Personalized itineraries'],
  }

  it('renders the demo name and description', () => {
    render(<AemDemoCard demo={mockDemo} index={0} />)
    expect(
      screen.getByRole('heading', { name: 'Test Cruises' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Sail through a test catalog')).toBeInTheDocument()
    expect(screen.getByText('Explore Test Cruises')).toBeInTheDocument()
  })

  it('links to the external demo in a new tab', () => {
    render(<AemDemoCard demo={mockDemo} index={0} />)
    const link = screen.getByRole('link', { name: /Test Cruises/ })
    expect(link).toHaveAttribute('href', 'https://example.com/cruises')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('announces that the link opens in a new tab', () => {
    render(<AemDemoCard demo={mockDemo} index={0} />)
    expect(screen.getByRole('link')).toHaveAccessibleName(
      /\(opens in a new tab\)$/,
    )
  })

  it('reveals features and AEM ownership independently of the external link', async () => {
    const user = userEvent.setup()
    render(<AemDemoCard demo={mockDemo} index={0} />)
    const trigger = screen.getByRole('button', { name: /Features & info/ })
    expect(screen.getByText('Personalized itineraries')).not.toBeVisible()
    expect(screen.getByRole('link')).not.toContainElement(trigger)

    await user.click(trigger)
    await waitFor(() =>
      expect(screen.getByText('Personalized itineraries')).toBeVisible(),
    )
    expect(
      screen.getByText(
        'Owned and maintained by the AEM team, not Demo Engineering.',
      ),
    ).toBeVisible()
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    await user.click(trigger)
    await waitFor(() =>
      expect(screen.getByText('Personalized itineraries')).not.toBeVisible(),
    )
  })
})
