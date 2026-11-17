import { describe, expect, it, vi } from 'vitest'

import { FashionArticleProducts } from '@/app/fashion/article/[id]/_components/FashionArticleProducts'

import { render, screen } from '@tests/helpers/test-utils'

// Hit pulls in the store-availability badge, which reads the App Router.
vi.mock('next/navigation', () => {
  return {
    useRouter: () => {
      return { push: vi.fn(), replace: vi.fn() }
    },
    usePathname: () => '/fashion/article/fashion-article-zip-and-puff-city-kit',
    useSearchParams: () => new URLSearchParams(),
  }
})

const buildProduct = (objectID: string, name: string, brand: string) => {
  return {
    objectID,
    name,
    brand,
    primary_image: `https://cdn.example.com/${objectID}.jpg`,
    price: { value: 610 },
  }
}

const PRODUCTS = [
  buildProduct('M0E20000000DU05', 'Hooded Zip Sweatshirt', 'Moncler'),
  buildProduct('M0E20000000EXIQ', 'Skinny Jeans', 'Siviglia'),
  buildProduct('A0E200000002EAN', 'Top Handle Bag', 'DKNY'),
]

describe('FashionArticleProducts', () => {
  it('renders a card per connected product, linking through to its PDP', () => {
    render(<FashionArticleProducts products={PRODUCTS} isLoading={false} />)

    expect(
      screen.getByRole('heading', { name: 'Shop the Story' }),
    ).toBeInTheDocument()

    expect(screen.getByText('Hooded Zip Sweatshirt')).toBeInTheDocument()
    expect(screen.getByText('Moncler')).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute(
      'href',
      '/fashion/product/M0E20000000DU05',
    )
    expect(links[2]).toHaveAttribute(
      'href',
      '/fashion/product/A0E200000002EAN',
    )
  })

  it('renders nothing when the article resolved no products', () => {
    const { container } = render(
      <FashionArticleProducts products={[]} isLoading={false} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the section with a skeleton while products are loading', () => {
    render(<FashionArticleProducts products={[]} isLoading />)

    expect(
      screen.getByRole('heading', { name: 'Shop the Story' }),
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})
