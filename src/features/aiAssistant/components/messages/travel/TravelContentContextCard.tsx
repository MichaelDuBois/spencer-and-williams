'use client'

import { useAtomValue } from 'jotai'

import { AIContextCardLayout } from '@/features/aiAssistant/components/AIContextCardLayout'
import {
  travelContentContextState,
  type TravelContentContext,
} from '@/features/aiAssistant/stores/aiAssistant'

interface DisplayValues {
  label: string
  image?: string
  imageAlt: string
  eyebrow: string | null
  title: string
  subtitle: string | null
}

const extractDisplayValues = (context: TravelContentContext): DisplayValues => {
  if (context.contentType === 'article') {
    const { title, author, image, location } = context.record
    return {
      label: 'Viewing this article:',
      image,
      imageAlt: title,
      eyebrow: location || null,
      title,
      subtitle: author || null,
    }
  }

  const { record } = context
  const episodeTitle = record.episode || record.title
  const seriesTitle = record.title !== episodeTitle ? record.title : null
  const hostLabel = record.hosts?.join(', ') ?? ''
  return {
    label: 'Viewing this podcast:',
    image: record.image,
    imageAlt: episodeTitle,
    eyebrow: seriesTitle,
    title: episodeTitle,
    subtitle: hostLabel ? `Hosted by ${hostLabel}` : null,
  }
}

/**
 * Displays the current travel content context (article or podcast) in the AI
 * assistant. Compact card shown in the message flow when viewing a travel PDP.
 */
export const TravelContentContextCard = () => {
  const context = useAtomValue(travelContentContextState)

  if (!context) return null

  const { label, image, imageAlt, eyebrow, title, subtitle } =
    extractDisplayValues(context)

  return (
    <AIContextCardLayout
      label={label}
      image={image}
      imageAlt={imageAlt}
      imageFit="cover">
      {eyebrow && (
        <p className="text-muted-foreground text-micro truncate tracking-wide uppercase">
          {eyebrow}
        </p>
      )}
      <p className="truncate text-xs leading-tight font-medium">{title}</p>
      {subtitle && (
        <p className="text-muted-foreground text-micro truncate">{subtitle}</p>
      )}
    </AIContextCardLayout>
  )
}
