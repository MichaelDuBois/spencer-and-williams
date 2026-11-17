'use client'

import { Highlight } from 'react-instantsearch'

import type { RecipeAttr } from '@/app/grocery/hitValues.types'
import type { AutocompleteHitProps } from '@/components/autocomplete/AutocompletePanel'
import { Image } from '@/components/image/Image'

import type { Hit } from 'instantsearch.js'

export const RecipeAutocompleteHit = ({
  item,
  onSelect,
}: AutocompleteHitProps) => {
  const image = typeof item.image === 'string' ? item.image : undefined
  const attrs = Array.isArray(item.attrs) ? (item.attrs as RecipeAttr[]) : []
  const meta = attrs
    .filter((attr) => attr.key === 'Prep' || attr.key === 'Level')
    .map((attr) => attr.val)
    .join(' • ')

  return (
    <div
      role="button"
      className="group hover:bg-muted flex w-40 cursor-pointer flex-col gap-2 rounded-md p-2 transition-colors duration-200"
      onClick={onSelect}>
      <Image
        src={image}
        alt=""
        width={144}
        height={96}
        className="rounded-image h-24 w-full object-cover"
        fallbackClassName="rounded-image h-24 w-full"
      />
      <div className="text-foreground line-clamp-2 text-sm leading-snug font-medium">
        <Highlight
          hit={item as Hit<Record<string, unknown>>}
          attribute="name"
        />
      </div>
      {meta && <span className="text-muted-foreground text-xs">{meta}</span>}
    </div>
  )
}
