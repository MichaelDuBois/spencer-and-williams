import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ProductBreadcrumb } from '@/components/product/ProductBreadcrumb'

vi.mock('next/link', () => {
  return {
    default: ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode
      href: string
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  }
})

describe('ProductBreadcrumb', () => {
  it('renders home, search link, and product name by default', () => {
    render(
      <ProductBreadcrumb
        slug="furnishing"
        searchLabel="Furniture"
        productName="Velvet Loveseat"
      />,
    )

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/furnishing',
    )
    expect(screen.getByRole('link', { name: 'Furniture' })).toHaveAttribute(
      'href',
      '/furnishing/search',
    )
    expect(screen.getByText('Velvet Loveseat')).toBeInTheDocument()
  })

  it('renders category links instead of the search link when categories are provided', () => {
    render(
      <ProductBreadcrumb
        slug="furnishing"
        searchLabel="Furniture"
        productName="Velvet Loveseat"
        categories={[
          { label: 'Living Room', href: '/furnishing/category/living-room' },
          { label: 'Sofas', href: '/furnishing/category/sofas' },
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Living Room' })).toHaveAttribute(
      'href',
      '/furnishing/category/living-room',
    )
    expect(screen.getByRole('link', { name: 'Sofas' })).toHaveAttribute(
      'href',
      '/furnishing/category/sofas',
    )
    expect(
      screen.queryByRole('link', { name: 'Furniture' }),
    ).not.toBeInTheDocument()
  })

  it('falls back to the search link when categories is empty', () => {
    render(
      <ProductBreadcrumb
        slug="furnishing"
        searchLabel="Furniture"
        productName="Velvet Loveseat"
        categories={[]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Furniture' })).toHaveAttribute(
      'href',
      '/furnishing/search',
    )
  })
})
