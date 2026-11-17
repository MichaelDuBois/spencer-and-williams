import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RecipeShoppingList } from '@/app/grocery/recipe/[id]/_components/RecipeShoppingList'
import { activeConfigAtom } from '@/stores/activeConfig'
import { getCartAtom } from '@/stores/cart'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { createMockConfig } from '@tests/helpers/test-utils'

const { sendAddToCartEventMock } = vi.hoisted(() => {
  return { sendAddToCartEventMock: vi.fn() }
})

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendAddToCartEvent: sendAddToCartEventMock }
    },
  }
})

vi.mock('next/link', () => {
  return {
    default: ({
      children,
      href,
    }: {
      children: React.ReactNode
      href: string
    }) => <a href={href}>{children}</a>,
  }
})

const buildProduct = (objectID: string, name: string, price: number | null) => {
  return {
    objectID,
    name,
    price,
    image: `/${objectID}.webp`,
    productUrl: `/grocery/product/${objectID}`,
  }
}

// A grocery hit is not price-normalised, so a null price reaches the cart
// verbatim — the shape that used to abort the whole "Add all" loop. The
// component already guards `price != null` when rendering, so it is the
// realistic invalid input that still renders.
const FLOUR = buildProduct('p1', 'Flour', 3)
const YEAST = buildProduct('p2', 'Yeast', null)
const SALT = buildProduct('p3', 'Salt', 1)
const WATER = buildProduct('p4', 'Water', null)

let mockedProducts: ReturnType<typeof buildProduct>[] = []

vi.mock('@/app/grocery/recipe/[id]/_hooks/useRecipeIngredientProducts', () => {
  return {
    useRecipeIngredientProducts: () => {
      const ingredients = mockedProducts.map((product, index) => {
        return {
          ingredient: `ingredient-${index}`,
          label: product.name,
          quantity: 1,
          unit: 'cup',
          product,
        }
      })
      return {
        ingredients,
        matchedProducts: ingredients,
        isLoading: false,
        isError: false,
      }
    },
  }
})

const VERTICAL = 'grocery-recipe-test'

const renderShoppingList = () => {
  const store = createTestStore((s) =>
    s.set(activeConfigAtom, createMockConfig({ slug: VERTICAL })),
  )
  render(
    <Provider store={store}>
      <RecipeShoppingList recipeId="r1" steps={[]} />
    </Provider>,
  )
  return {
    store,
    getCartItems: () => store.get(getCartAtom(VERTICAL)).items,
  }
}

const clickAddAll = () =>
  fireEvent.click(screen.getByRole('button', { name: /Add all to cart/ }))

const trackedObjectIDs = () =>
  sendAddToCartEventMock.mock.calls.map(([input]) => input.objectID)

describe('RecipeShoppingList "Add all to cart"', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mockedProducts = []
    sendAddToCartEventMock.mockClear()
  })

  it('adds every valid product and skips the invalid ones', () => {
    mockedProducts = [FLOUR, YEAST, SALT, WATER]
    const { getCartItems } = renderShoppingList()

    clickAddAll()

    expect(getCartItems().map((item) => item.objectID)).toEqual(['p1', 'p3'])
    expect(trackedObjectIDs()).toEqual(['p1', 'p3'])
  })

  it('still confirms the addition when an invalid product is present', () => {
    mockedProducts = [FLOUR, YEAST, SALT]
    renderShoppingList()

    clickAddAll()

    expect(screen.getByText('Added to cart')).toBeInTheDocument()
  })

  it('does not throw when the first product is invalid', () => {
    mockedProducts = [YEAST, FLOUR]
    const { getCartItems } = renderShoppingList()

    expect(() => clickAddAll()).not.toThrow()
    expect(getCartItems().map((item) => item.objectID)).toEqual(['p1'])
    expect(screen.getByText('Added to cart')).toBeInTheDocument()
  })

  it('adds every product when all of them are valid', () => {
    mockedProducts = [FLOUR, SALT]
    const { getCartItems } = renderShoppingList()

    clickAddAll()

    expect(getCartItems().map((item) => item.objectID)).toEqual(['p1', 'p3'])
    expect(screen.getByText('Added to cart')).toBeInTheDocument()
  })

  it('tracks one recipe add per product added', () => {
    mockedProducts = [FLOUR, SALT]
    renderShoppingList()

    clickAddAll()

    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(2)
    expect(sendAddToCartEventMock).toHaveBeenNthCalledWith(
      1,
      { objectID: 'p1', queryID: undefined, price: 3, quantity: 1 },
      { surface: 'recipe' },
    )
    expect(sendAddToCartEventMock).toHaveBeenNthCalledWith(
      2,
      { objectID: 'p3', queryID: undefined, price: 1, quantity: 1 },
      { surface: 'recipe' },
    )
  })

  it('tracks a single recipe add from its row button', () => {
    mockedProducts = [FLOUR]
    const { getCartItems } = renderShoppingList()

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    expect(getCartItems().map((item) => item.objectID)).toEqual(['p1'])
    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
    expect(sendAddToCartEventMock).toHaveBeenCalledWith(
      { objectID: 'p1', queryID: undefined, price: 3, quantity: 1 },
      { surface: 'recipe' },
    )
  })

  it('skips an invalid product added from its own row button', () => {
    mockedProducts = [YEAST]
    const { getCartItems } = renderShoppingList()

    const rowButton = screen.getByRole('button', { name: 'Add to Cart' })
    expect(() => fireEvent.click(rowButton)).not.toThrow()
    expect(getCartItems()).toEqual([])
    expect(sendAddToCartEventMock).not.toHaveBeenCalled()
  })
})
