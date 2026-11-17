'use client'

import Link from 'next/link'

import type { HitProductValues } from '@/components/hit/hit.types'
import { Image } from '@/components/image/Image'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'

interface ChatComparisonProductCardProps {
  product: Pick<HitProductValues, 'objectID' | 'productUrl' | 'name' | 'image'>
}

export const ChatComparisonProductCard = ({
  product,
}: ChatComparisonProductCardProps) => {
  const handleLinkClick = useAssistantLinkClick(product.objectID)

  return (
    <Link
      href={product.productUrl}
      onClick={handleLinkClick}
      className="text-foreground hover:text-accent focus-visible:outline-accent flex items-center gap-3 rounded-sm bg-white p-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2">
      <div
        aria-hidden="true"
        className="bg-card relative h-12 w-12 shrink-0 overflow-hidden rounded">
        <Image
          src={product.image}
          alt=""
          fill
          sizes="48px"
          className="object-contain"
        />
      </div>
      <span
        title={product.name}
        className="line-clamp-2 min-w-0 text-sm leading-snug font-semibold wrap-anywhere">
        {product.name}
      </span>
    </Link>
  )
}
