'use client'

import { useAtomValue } from 'jotai'

import { AIContextCardLayout } from '@/features/aiAssistant/components/AIContextCardLayout'
import {
  b2bContentContextState,
  type B2BContentContext,
} from '@/features/aiAssistant/stores/aiAssistant'

interface DisplayValues {
  title: string
  image: string | undefined
  category: string | undefined
  subtitle: string | undefined
}

const extractDisplayValues = (context: B2BContentContext): DisplayValues => {
  switch (context.contentType) {
    case 'blogs': {
      const { title, image, category, authorDisplay } = context.record
      return { title, image, category, subtitle: authorDisplay }
    }
    case 'resources': {
      const { title, image, docType } = context.record
      return { title, image, category: docType, subtitle: undefined }
    }
    case 'articles': {
      const { title, category, section } = context.record
      return { title, image: undefined, category, subtitle: section }
    }
    case 'documentation': {
      const { title, docType, category } = context.record
      return { title, image: undefined, category: docType, subtitle: category }
    }
  }
}

export const B2BContentContextCard = () => {
  const contentContext = useAtomValue(b2bContentContextState)

  if (!contentContext) return null

  const { title, image, category, subtitle } =
    extractDisplayValues(contentContext)

  return (
    <AIContextCardLayout
      label="Viewing this content:"
      image={image}
      imageAlt={title}
      imageFit="cover">
      {category && (
        <p className="text-muted-foreground text-micro truncate tracking-wide uppercase">
          {category}
        </p>
      )}
      <p className="truncate text-xs leading-tight font-medium">{title}</p>
      {subtitle && (
        <p className="text-muted-foreground text-micro truncate">{subtitle}</p>
      )}
    </AIContextCardLayout>
  )
}
