import { Clock } from 'lucide-react'
import Link from 'next/link'

import type { RecipeHitValues } from '@/app/grocery/hitValues.types'
import { Image } from '@/components/image/Image'

interface RecipeCardProps {
  recipe: RecipeHitValues
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const prep = recipe.attrs?.find((attr) => attr.key === 'Prep')?.val
  const level = recipe.attrs?.find((attr) => attr.key === 'Level')?.val

  return (
    <Link
      href={recipe.productUrl}
      className="group border-border bg-card rounded-card flex h-full flex-col overflow-hidden border transition-shadow duration-200 hover:shadow-md">
      <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.name}
          fill
          sizes="(max-width: 768px) 50vw, 220px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-foreground line-clamp-2 text-sm leading-snug font-medium">
          {recipe.name}
        </h3>
        <div className="text-muted-foreground mt-auto flex items-center gap-3 pt-3 text-xs">
          {prep && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {prep}
            </span>
          )}
          {level && <span>{level}</span>}
        </div>
      </div>
    </Link>
  )
}
