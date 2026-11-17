import type { RecipeHitValues } from '@/app/grocery/hitValues.types'
import { Image } from '@/components/image/Image'

interface RecipeHeroProps {
  recipe: RecipeHitValues
}

export const RecipeHero = ({ recipe }: RecipeHeroProps) => (
  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,620px)_1fr]">
    <div className="rounded-image bg-muted relative aspect-3/2 w-full self-start overflow-hidden">
      <Image
        src={recipe.image}
        alt={recipe.name}
        fill
        sizes="(max-width: 1024px) 100vw, 620px"
        className="object-cover"
        preload
      />
    </div>

    <div className="space-y-5">
      <h1 className="text-foreground text-3xl font-bold tracking-tight lg:text-4xl">
        {recipe.name}
      </h1>

      {recipe.attrs && recipe.attrs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.attrs.map((attr) => (
            <span
              key={attr.key}
              className="bg-accent/10 text-accent rounded-badge inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">
              <span className="text-muted-foreground text-xs uppercase">
                {attr.key}
              </span>
              {attr.val}
            </span>
          ))}
        </div>
      )}

      {recipe.description && (
        <p className="text-muted-foreground leading-relaxed">
          {recipe.description}
        </p>
      )}
    </div>
  </div>
)
