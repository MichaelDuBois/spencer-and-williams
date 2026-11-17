import { humanizeSlug } from '@/app/grocery/_utils/humanizeSlug'
import type { GrocerySemanticAttributes } from '@/app/grocery/hitValues.types'

interface GroceryProductDetailsProps {
  attributes: GrocerySemanticAttributes
}

export const GroceryProductDetails = ({
  attributes,
}: GroceryProductDetailsProps) => {
  const rows: { label: string; value: string }[] = [
    { label: 'Country of origin', value: attributes.countryOfOrigin ?? '' },
    { label: 'Pack quantity', value: attributes.packQuantity ?? '' },
    { label: 'Storage', value: attributes.storage ?? '' },
    { label: 'Allergens', value: attributes.allergens ?? '' },
    { label: 'Preparation', value: attributes.preparationTime ?? '' },
    { label: 'Seasonal', value: attributes.seasonal ?? '' },
  ]
    .filter((row) => row.value)
    .map((row) => {
      return { ...row, value: humanizeSlug(row.value) }
    })

  const suggestions = attributes.servingSuggestions ?? []

  if (rows.length === 0 && suggestions.length === 0) return null

  return (
    <div className="space-y-4">
      {rows.length > 0 && (
        <dl className="divide-border divide-y">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 py-1.5">
              <dt>{label}</dt>
              <dd className="text-foreground text-right font-medium capitalize">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {suggestions.length > 0 && (
        <div>
          <p className="text-foreground mb-1.5 font-medium">
            Serving suggestions
          </p>
          <ul className="list-inside list-disc space-y-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
