'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'

import { GroceryListImportButton } from '@/app/grocery/_components/GroceryListImportButton'
import { Button } from '@/components/ui/button/Button'

interface GroceryListSidebarProps {
  ingredients: string[]
  onAdd: (name: string) => void
  onImport: (names: string[]) => void
  onRemove: (name: string) => void
  onClearAll: () => void
}

export const GroceryListSidebar = ({
  ingredients,
  onAdd,
  onImport,
  onRemove,
  onClearAll,
}: GroceryListSidebarProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd(value)
    setValue('')
  }

  return (
    <aside className="border-border bg-card rounded-card space-y-5 border p-5 lg:sticky lg:top-24">
      <div>
        <h2 className="text-foreground text-xl font-bold">Grocery list</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Add ingredients to see matching products.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Add an ingredient…"
          aria-label="Add an ingredient"
          className="border-border bg-background text-foreground rounded-button focus-visible:ring-accent w-full border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-button shrink-0"
          aria-label="Add ingredient">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <GroceryListImportButton onImport={onImport} />

      {ingredients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {ingredients.length} {ingredients.length === 1 ? 'item' : 'items'}
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs transition-colors">
              Clear all
            </button>
          </div>

          <ul className="divide-border divide-y">
            {ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="flex items-center justify-between gap-2 py-2">
                <span className="text-foreground text-sm capitalize">
                  {ingredient}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(ingredient)}
                  aria-label={`Remove ${ingredient}`}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
