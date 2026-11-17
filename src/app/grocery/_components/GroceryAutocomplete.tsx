'use client'

import { GroceryAutocompletePanel } from '@/app/grocery/_components/GroceryAutocompletePanel'
import { AutocompleteWidget } from '@/components/autocomplete/AutocompleteWidget'

interface GroceryAutocompleteProps {
  basePath: string
}

export const GroceryAutocomplete = ({ basePath }: GroceryAutocompleteProps) => (
  <AutocompleteWidget
    basePath={basePath}
    placeholder="Search for groceries..."
    showSuggestions
    showAISuggestions
    showRecipes
    showAIButton
    querySuggestionsHitsPerPage={5}
    panelComponent={GroceryAutocompletePanel}
  />
)
