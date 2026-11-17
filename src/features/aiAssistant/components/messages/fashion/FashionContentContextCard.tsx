'use client'

import { useAtomValue } from 'jotai'

import { AIContextCardLayout } from '@/features/aiAssistant/components/AIContextCardLayout'
import { fashionContentContextState } from '@/features/aiAssistant/stores/aiAssistant'

export const FashionContentContextCard = () => {
  const context = useAtomValue(fashionContentContextState)

  if (!context) return null

  const { title, category, thumbnail, image, author } = context

  return (
    <AIContextCardLayout
      label="Viewing this article:"
      image={thumbnail ?? image}
      imageAlt={title}
      imageFit="cover">
      {category && (
        <p className="text-muted-foreground text-micro truncate tracking-wide uppercase">
          {category}
        </p>
      )}
      <p className="truncate text-xs leading-tight font-medium">{title}</p>
      {author?.name && (
        <p className="text-muted-foreground text-micro truncate">
          {author.name}
        </p>
      )}
    </AIContextCardLayout>
  )
}
