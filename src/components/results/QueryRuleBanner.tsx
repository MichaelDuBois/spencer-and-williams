'use client'

import Link from 'next/link'
import { useInstantSearch } from 'react-instantsearch'

import { Image } from '@/components/image/Image'
import { cn } from '@/lib/utils'

interface BannerImage {
  urls: Array<{ url: string }>
  title?: string
}

interface BannerLink {
  url: string
  target?: '_blank' | '_self'
}

interface Banner {
  image: BannerImage
  link?: BannerLink
}

interface RenderingContent {
  widgets?: {
    banners?: Banner[]
  }
}

interface QueryRuleBannerProps {
  className?: string
}

export const QueryRuleBanner = ({ className }: QueryRuleBannerProps) => {
  const { results } = useInstantSearch()

  const renderingContent = results?.renderingContent as
    | RenderingContent
    | undefined
  const banner = renderingContent?.widgets?.banners?.[0]

  if (!banner?.image?.urls?.[0]?.url) return null

  const imageUrl = banner.image.urls[0].url
  const altText = banner.image.title ?? 'Promotional banner'

  const image = (
    <div className="relative aspect-4/1">
      <Image
        src={imageUrl}
        alt={altText}
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  )

  return (
    <div className={cn('rounded-card mb-8 overflow-hidden', className)}>
      {banner.link?.url ? (
        <Link
          href={banner.link.url}
          target={banner.link.target}
          rel={
            banner.link.target === '_blank' ? 'noopener noreferrer' : undefined
          }>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  )
}
