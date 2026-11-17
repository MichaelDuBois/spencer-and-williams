'use client'

import { ListOrdered } from 'lucide-react'
import Link from 'next/link'

import { humanizeSlug } from '@/app/grocery/_utils/humanizeSlug'
import type { RecipeHitValues } from '@/app/grocery/hitValues.types'
import { Image } from '@/components/image/Image'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import type { VerticalDisplayItem } from '@/features/aiAssistant/types'
import { cn } from '@/lib/utils'

interface GroceryRecipeCardProps {
  item: VerticalDisplayItem
  directData?: RecipeHitValues
}

export const GroceryRecipeCard = ({
  item,
  directData,
}: GroceryRecipeCardProps) => {
  const recipeData = directData
  const handleLinkClick = useAssistantLinkClick(item.objectID)

  if (!recipeData) {
    return (
      <div
        className={cn(
          'border-border bg-card rounded-card w-64 shrink-0 animate-pulse overflow-hidden border',
        )}>
        <div className="bg-card h-36 w-full" />
        <div className="space-y-2 p-3">
          <div className="bg-background/50 h-4 w-full rounded" />
          <div className="bg-background/50 h-3 w-full rounded" />
          <div className="bg-background/50 h-3 w-3/4 rounded" />
        </div>
      </div>
    )
  }

  const stepsCount = recipeData.steps?.length ?? 0
  const ingredients = recipeData.steps
    ?.map((step) => step.ingredient)
    .filter(
      (ingredient): ingredient is string => typeof ingredient === 'string',
    )
    .map((ingredient) => humanizeSlug(ingredient).toLowerCase())
    .filter(Boolean)
    .slice(0, 3)
  const firstStep = recipeData.steps?.find(
    (step) => step.title || step.explanation,
  )

  return (
    <Link
      href={`/grocery/recipe/${encodeURIComponent(item.objectID)}`}
      onClick={handleLinkClick}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'border-border bg-card group rounded-card flex h-full w-64 shrink-0 flex-col overflow-hidden border transition-shadow duration-200 hover:shadow-md',
      )}>
      {/* Image */}
      <div className="bg-card relative h-36 w-full shrink-0 overflow-hidden">
        <Image
          src={recipeData.image}
          alt={recipeData.name}
          fill
          sizes="256px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h4 className="text-foreground line-clamp-2 text-sm leading-tight font-semibold">
          {recipeData.name}
        </h4>
        {recipeData.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {recipeData.description}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-2">
          {!!ingredients?.length && (
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {ingredients.join(' · ')}
            </p>
          )}
          {firstStep && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {firstStep.title || firstStep.explanation}
            </p>
          )}
          {stepsCount > 0 && (
            <span className="bg-accent/10 text-accent text-micro inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-medium">
              <ListOrdered className="h-3 w-3" />
              {stepsCount} {stepsCount === 1 ? 'step' : 'steps'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
