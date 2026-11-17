'use client'

import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { groceryListAtom } from '@/stores/groceryList'

const includesName = (list: string[], name: string) =>
  list.some((existing) => existing.toLowerCase() === name.toLowerCase())

export const useGroceryList = () => {
  const [ingredients, setIngredients] = useAtom(groceryListAtom)

  const addIngredient = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setIngredients((prev) =>
        includesName(prev, trimmed) ? prev : [...prev, trimmed],
      )
    },
    [setIngredients],
  )

  const importIngredients = useCallback(
    (names: string[]) => {
      setIngredients((prev) => {
        const next = [...prev]
        for (const name of names) {
          const trimmed = name.trim()
          if (trimmed && !includesName(next, trimmed)) next.push(trimmed)
        }
        return next
      })
    },
    [setIngredients],
  )

  const removeIngredient = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setIngredients((prev) =>
        prev.filter(
          (existing) => existing.toLowerCase() !== trimmed.toLowerCase(),
        ),
      )
    },
    [setIngredients],
  )

  const clearAll = useCallback(() => {
    setIngredients([])
  }, [setIngredients])

  return {
    ingredients,
    addIngredient,
    importIngredients,
    removeIngredient,
    clearAll,
  }
}
