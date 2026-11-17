'use client'

import { Check, ListChecks, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useGroceryList } from '@/app/grocery/_hooks/useGroceryList'
import type { RecipeStep } from '@/app/grocery/hitValues.types'
import {
  useRecipeIngredientProducts,
  type ResolvedIngredient,
} from '@/app/grocery/recipe/[id]/_hooks/useRecipeIngredientProducts'
import { Image } from '@/components/image/Image'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { Button } from '@/components/ui/button/Button'
import { useAddToCart } from '@/hooks/useAddToCart'

interface RecipeShoppingListProps {
  recipeId: string
  steps: RecipeStep[]
}

const IngredientRow = ({ item }: { item: ResolvedIngredient }) => {
  const { addToCart } = useAddToCart({ surface: 'recipe' })
  const { product } = item

  if (!product) {
    return (
      <li className="flex items-center justify-between gap-3 py-3">
        <span className="text-foreground text-sm font-medium capitalize">
          {item.quantity} {item.unit} {item.label}
        </span>
        <span className="text-muted-foreground text-xs">Not available</span>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <Link
        href={product.productUrl}
        className="rounded-image border-border relative h-14 w-14 shrink-0 overflow-hidden border">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="56px"
          className="object-contain p-1"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs capitalize">
          {item.quantity} {item.unit} {item.label}
        </p>
        <Link
          href={product.productUrl}
          className="text-foreground line-clamp-1 text-sm font-medium hover:underline">
          {product.name}
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {product.price != null && (
          <span className="text-foreground text-sm font-semibold">
            ${product.price.toFixed(2)}
          </span>
        )}
        <AddToCartButton
          compact
          animated={false}
          onAdd={() => addToCart(product)}
        />
      </div>
    </li>
  )
}

export const RecipeShoppingList = ({
  recipeId,
  steps,
}: RecipeShoppingListProps) => {
  const { addToCart } = useAddToCart({ surface: 'recipe' })
  const { importIngredients } = useGroceryList()
  const [isAdded, setIsAdded] = useState(false)
  const [isListAdded, setIsListAdded] = useState(false)
  const { ingredients, matchedProducts, isLoading } =
    useRecipeIngredientProducts({ recipeId, steps })

  const handleAddAll = () => {
    matchedProducts.forEach(({ product }) => addToCart(product))
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const handleAddToList = () => {
    importIngredients(ingredients.map((item) => item.label))
    setIsListAdded(true)
    setTimeout(() => setIsListAdded(false), 1500)
  }

  const totalPrice = matchedProducts.reduce(
    (sum, { product }) => sum + (product.price ?? 0),
    0,
  )

  return (
    <section className="border-border bg-card rounded-card space-y-4 border p-5 lg:sticky lg:top-24">
      <div className="flex items-baseline justify-between">
        <h2 className="text-foreground text-xl font-bold">Shop the recipe</h2>
        {matchedProducts.length > 0 && (
          <span className="text-muted-foreground text-sm">
            ${totalPrice.toFixed(2)}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Finding ingredients…</p>
      ) : (
        <>
          <ul className="divide-border divide-y">
            {ingredients.map((item) => (
              <IngredientRow key={item.ingredient} item={item} />
            ))}
          </ul>

          <div className="space-y-2">
            <Button
              onClick={handleAddAll}
              disabled={matchedProducts.length === 0}
              className="w-full rounded"
              size="lg">
              {isAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add all to cart ({matchedProducts.length})
                </>
              )}
            </Button>

            <Button
              onClick={handleAddToList}
              disabled={ingredients.length === 0}
              variant="outline"
              className="w-full rounded"
              size="lg">
              {isListAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to list
                </>
              ) : (
                <>
                  <ListChecks className="h-4 w-4" />
                  Add ingredients to list ({ingredients.length})
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
