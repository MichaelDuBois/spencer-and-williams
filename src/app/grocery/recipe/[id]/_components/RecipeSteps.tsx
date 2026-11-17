import { humanizeSlug } from '@/app/grocery/_utils/humanizeSlug'
import type { RecipeStep } from '@/app/grocery/hitValues.types'

interface RecipeStepsProps {
  steps: RecipeStep[]
}

export const RecipeSteps = ({ steps }: RecipeStepsProps) => (
  <section className="space-y-6">
    <h2 className="text-foreground text-2xl font-bold">Instructions</h2>
    <ol className="space-y-6">
      {steps.map((step, index) => (
        <li key={`${index}-${step.title}`} className="flex gap-4">
          <span className="bg-accent text-accent-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {index + 1}
          </span>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-foreground font-medium">{step.title}</h3>
              <span className="bg-muted text-muted-foreground rounded-badge px-2 py-0.5 text-xs font-medium capitalize">
                {step.quantity} {step.unit} {humanizeSlug(step.ingredient)}
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {step.explanation}
            </p>
          </div>
        </li>
      ))}
    </ol>
  </section>
)
