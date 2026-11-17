import { act, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { CategoryNav } from '@/components/header/CategoryNav'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  chatWidgetEnabledAtom,
  chatWidgetOpenAtom,
  demoOptionsStore,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'
import type { NavigationItem } from '@/types/verticalConfig.types'
import { getSlug } from '@/utilities/getSlug'

import {
  createMockConfig,
  render,
  screen,
  within,
} from '../../helpers/test-utils'

const basePath = '/ecommerce'
const href = (category: string) => `${basePath}/category/${getSlug(category)}`

const navigation: NavigationItem[] = [
  {
    label: 'Electronics',
    category: 'Electronics',
    children: [
      { label: 'Camera & Photo', category: 'Electronics > Camera & Photo' },
      { label: 'Headphones', category: 'Electronics > Headphones' },
    ],
  },
  {
    label: 'Women',
    category: 'Women',
    children: [
      {
        label: 'Bags',
        category: 'Women > Bags',
        children: [
          { label: 'Shoulder bags', category: 'Women > Bags > Shoulder bags' },
          { label: 'Totes', category: 'Women > Bags > Totes' },
        ],
      },
    ],
  },
]

describe('CategoryNav', () => {
  it('renders the top-level categories', () => {
    render(<CategoryNav navigation={navigation} basePath={basePath} />)

    // Top-level labels appear in both desktop nav and mobile drawer trigger area.
    expect(screen.getAllByText('Electronics').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Women').length).toBeGreaterThan(0)
  })

  afterEach(() => {
    demoOptionsStore.set(resetDemoOptionsAtom)
  })

  it('reserves space for an open official Chat panel', () => {
    const { store } = render(
      <CategoryNav navigation={navigation} basePath={basePath} />,
    )

    act(() => {
      store.set(
        activeConfigAtom,
        createMockConfig({
          features: { agentStudio: { chatWidgetAgentID: 'chat-agent-1' } },
        }),
      )
      demoOptionsStore.set(chatWidgetEnabledAtom, true)
      store.set(chatWidgetOpenAtom, true)
    })

    expect(screen.getByRole('navigation', { name: 'Categories' })).toHaveClass(
      'lg:pr-(--assistant-panel-width,400px)',
    )
  })

  it('reveals a one-level category’s children with correct hrefs on hover', () => {
    render(<CategoryNav navigation={navigation} basePath={basePath} />)

    const electronics = screen.getAllByText('Electronics')[0]
    fireEvent.mouseEnter(electronics.closest('li')!)

    const camera = screen.getByRole('link', { name: 'Camera & Photo' })
    expect(camera).toHaveAttribute(
      'href',
      href('Electronics > Camera & Photo'),
    )
    expect(
      screen.getByRole('link', { name: 'Headphones' }),
    ).toHaveAttribute('href', href('Electronics > Headphones'))
  })

  it('renders child column headers and grandchild links for a two-level category', () => {
    render(<CategoryNav navigation={navigation} basePath={basePath} />)

    const women = screen.getAllByText('Women')[0]
    fireEvent.mouseEnter(women.closest('li')!)

    // Child header link.
    expect(screen.getByRole('link', { name: 'Bags' })).toHaveAttribute(
      'href',
      href('Women > Bags'),
    )

    // Grandchild links.
    expect(
      screen.getByRole('link', { name: 'Shoulder bags' }),
    ).toHaveAttribute('href', href('Women > Bags > Shoulder bags'))
    expect(screen.getByRole('link', { name: 'Totes' })).toHaveAttribute(
      'href',
      href('Women > Bags > Totes'),
    )
  })

  it('opens the mobile drawer and expands a category to reveal nested links', () => {
    render(<CategoryNav navigation={navigation} basePath={basePath} />)

    fireEvent.click(screen.getByRole('button', { name: 'Browse categories' }))

    const drawer = screen.getByRole('navigation', { name: 'Browse categories' })

    // Expand "Women" via its chevron toggle.
    fireEvent.click(
      within(drawer).getByRole('button', { name: 'Expand Women' }),
    )

    // The nested child link is now visible inside the drawer with the right href.
    const bagsLinks = within(drawer)
      .getAllByRole('link', { name: 'Bags' })
      .filter((link) => link.getAttribute('href') === href('Women > Bags'))
    expect(bagsLinks.length).toBeGreaterThan(0)
  })
})
