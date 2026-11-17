import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useGroceryList } from '@/app/grocery/_hooks/useGroceryList'
import { groceryListAtom } from '@/stores/groceryList'

import { buildJotaiWrapper, createTestStore } from '../../helpers/jotai-wrapper'

const renderUseGroceryList = () => {
  const store = createTestStore()
  const utils = renderHook(() => useGroceryList(), {
    wrapper: buildJotaiWrapper(store),
  })
  return { ...utils, store }
}

describe('useGroceryList', () => {
  // atomWithStorage persists to localStorage, which is shared across tests.
  beforeEach(() => {
    localStorage.clear()
  })

  it('trims and adds an ingredient', () => {
    const { result } = renderUseGroceryList()
    act(() => result.current.addIngredient('  Milk  '))
    expect(result.current.ingredients).toEqual(['Milk'])
  })

  it('ignores empty or whitespace-only names', () => {
    const { result } = renderUseGroceryList()
    act(() => result.current.addIngredient('   '))
    expect(result.current.ingredients).toEqual([])
  })

  it('de-dupes case-insensitively when adding', () => {
    const { result } = renderUseGroceryList()
    act(() => result.current.addIngredient('Milk'))
    act(() => result.current.addIngredient('milk'))
    act(() => result.current.addIngredient('MILK'))
    expect(result.current.ingredients).toEqual(['Milk'])
  })

  it('bulk-imports with trimming and case-insensitive de-dupe', () => {
    const { result } = renderUseGroceryList()
    act(() => result.current.addIngredient('Milk'))
    act(() =>
      result.current.importIngredients([
        ' Eggs ',
        'milk',
        'Bread',
        'eggs',
        '   ',
      ]),
    )
    expect(result.current.ingredients).toEqual(['Milk', 'Eggs', 'Bread'])
  })

  it('removes an ingredient case-insensitively', () => {
    const { result } = renderUseGroceryList()
    act(() => result.current.importIngredients(['Milk', 'Eggs']))
    act(() => result.current.removeIngredient('MILK'))
    expect(result.current.ingredients).toEqual(['Eggs'])
  })

  it('trims whitespace before removing', () => {
    const { result } = renderUseGroceryList()
    act(() => result.current.importIngredients(['Milk', 'Eggs']))
    act(() => result.current.removeIngredient('  Milk  '))
    expect(result.current.ingredients).toEqual(['Eggs'])
  })

  it('clears the entire list', () => {
    const { result } = renderUseGroceryList()
    act(() => result.current.importIngredients(['Milk', 'Eggs']))
    act(() => result.current.clearAll())
    expect(result.current.ingredients).toEqual([])
  })

  it('persists state to the backing Jotai atom', () => {
    const { result, store } = renderUseGroceryList()
    act(() => result.current.addIngredient('Milk'))
    expect(store.get(groceryListAtom)).toEqual(['Milk'])
  })
})
