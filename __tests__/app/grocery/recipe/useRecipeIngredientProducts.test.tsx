import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RecipeStep } from '@/app/grocery/hitValues.types'
import { useRecipeIngredientProducts } from '@/app/grocery/recipe/[id]/_hooks/useRecipeIngredientProducts'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const searchMock = vi.fn()

const STEPS: RecipeStep[] = [
  {
    title: 'Boil the pasta',
    ingredient: 'ditalini_pasta',
    quantity: 250,
    unit: 'g',
    explanation: 'Salt the water first.',
  },
]

const buildStore = () =>
  createTestStore((store) => {
    store.set(searchClientAtom, createMockSearchClient({ search: searchMock }))
    store.set(searchClientKeyAtom, 'standard')
  })

const renderRecipeIngredientProducts = (
  store: ReturnType<typeof buildStore>,
) =>
  renderHook(
    () => useRecipeIngredientProducts({ recipeId: 'r1', steps: STEPS }),
    { wrapper: buildProvidersWrapper({ store }).Wrapper },
  )

describe('useRecipeIngredientProducts', () => {
  beforeEach(() => {
    searchMock.mockReset()
    searchMock.mockResolvedValue({
      results: [
        {
          hits: [{ objectID: 'p1', name: 'Ditalini Pasta', type: 'pasta' }],
        },
      ],
    })
  })

  it('resolves each unique ingredient to a product from the grocery index', async () => {
    const { result } = renderRecipeIngredientProducts(buildStore())

    await waitFor(() => expect(result.current.matchedProducts).toHaveLength(1))

    expect(searchMock).toHaveBeenCalledWith([
      {
        indexName: 'grocery_prod_ns',
        params: { query: 'ditalini pasta', hitsPerPage: 1 },
      },
    ])
    expect(result.current.ingredients[0].product).toMatchObject({
      objectID: 'p1',
      name: 'Ditalini Pasta',
    })
  })

  // Swapping the client changes no search parameter, so its identity is the only
  // thing that can invalidate these products when the composition toggle moves.
  it('refetches when the installed search client swaps pipelines', async () => {
    const store = buildStore()
    const { result } = renderRecipeIngredientProducts(store)

    await waitFor(() => expect(result.current.matchedProducts).toHaveLength(1))
    expect(searchMock).toHaveBeenCalledTimes(1)

    act(() => {
      store.set(searchClientKeyAtom, 'composition')
    })

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
  })
})
