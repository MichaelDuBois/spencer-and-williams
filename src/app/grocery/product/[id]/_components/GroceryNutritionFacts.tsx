import type { GroceryNutrition } from '@/app/grocery/hitValues.types'

interface GroceryNutritionFactsProps {
  nutrition: GroceryNutrition
}

const NUTRITION_ROWS: { key: keyof GroceryNutrition; label: string }[] = [
  { key: 'calories', label: 'Calories' },
  { key: 'totalFat', label: 'Total Fat' },
  { key: 'saturatedFat', label: 'Saturated Fat' },
  { key: 'transFat', label: 'Trans Fat' },
  { key: 'monounsaturatedFat', label: 'Monounsaturated Fat' },
  { key: 'polyunsaturatedFat', label: 'Polyunsaturated Fat' },
  { key: 'cholesterol', label: 'Cholesterol' },
  { key: 'sodium', label: 'Sodium' },
  { key: 'carbohydrate', label: 'Total Carbohydrate' },
  { key: 'dietaryFiber', label: 'Dietary Fiber' },
  { key: 'sugars', label: 'Total Sugars' },
  { key: 'addedSugars', label: 'Added Sugars' },
  { key: 'protein', label: 'Protein' },
  { key: 'calcium', label: 'Calcium' },
  { key: 'iron', label: 'Iron' },
  { key: 'potassium', label: 'Potassium' },
  { key: 'vitaminD', label: 'Vitamin D' },
]

export const GroceryNutritionFacts = ({
  nutrition,
}: GroceryNutritionFactsProps) => {
  const rows = NUTRITION_ROWS.filter(({ key }) => nutrition[key])

  if (rows.length === 0) return null

  return (
    <div>
      {nutrition.servingSize && (
        <p className="text-foreground mb-2 font-medium">
          Serving size{' '}
          <span className="text-muted-foreground font-normal">
            {nutrition.servingSize}
          </span>
        </p>
      )}
      <dl className="divide-border divide-y">
        {rows.map(({ key, label }) => (
          <div key={key} className="flex justify-between py-1.5">
            <dt>{label}</dt>
            <dd className="text-foreground font-medium">{nutrition[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
