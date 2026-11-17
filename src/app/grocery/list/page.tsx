'use client'

import { GroceryListSidebar } from '@/app/grocery/_components/GroceryListSidebar'
import { IngredientCarouselsSection } from '@/app/grocery/_components/IngredientCarouselsSection'
import { useGroceryList } from '@/app/grocery/_hooks/useGroceryList'

const GroceryListPage = () => {
  const {
    ingredients,
    addIngredient,
    importIngredients,
    removeIngredient,
    clearAll,
  } = useGroceryList()

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-bold">Grocery List</h1>
        <p className="text-muted-foreground mt-1">
          Build your shopping list and discover matching products for every
          ingredient.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1">
          <GroceryListSidebar
            ingredients={ingredients}
            onAdd={addIngredient}
            onImport={importIngredients}
            onRemove={removeIngredient}
            onClearAll={clearAll}
          />
        </div>

        <div className="lg:col-span-3">
          <IngredientCarouselsSection ingredients={ingredients} />
        </div>
      </div>
    </div>
  )
}

export default GroceryListPage
