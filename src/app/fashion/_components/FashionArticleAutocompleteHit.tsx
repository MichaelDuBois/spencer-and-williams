'use client'

import { getFashionArticleHitValues } from '@/app/fashion/_utils/getFashionArticleHitValues'
import { fashionConfig } from '@/app/fashion/config'
import type { AutocompleteHitProps } from '@/components/autocomplete/AutocompletePanel'
import { Image } from '@/components/image/Image'

export const FashionArticleAutocompleteHit = ({
  item,
  onSelect,
}: AutocompleteHitProps) => {
  const { title, thumbnail, image, category } = getFashionArticleHitValues(
    item,
    ARTICLE_TEMPLATE,
    fashionConfig.slug,
  )

  return (
    <div
      role="button"
      onClick={onSelect}
      className="hover:bg-muted flex w-40 cursor-pointer flex-col gap-2 p-2">
      <Image
        src={thumbnail ?? image}
        alt=""
        width={144}
        height={192}
        className="aspect-3/4 w-full object-cover"
        fallbackClassName="aspect-3/4 w-full"
      />
      <div className="min-w-0">
        <p className="text-foreground line-clamp-2 text-sm font-medium">
          {title}
        </p>
        {category && (
          <p className="text-muted-foreground mt-1 text-xs">{category}</p>
        )}
      </div>
    </div>
  )
}

const ARTICLE_TEMPLATE = fashionConfig.algolia.indices.articles.template!
