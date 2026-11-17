import { Headphones, Play } from 'lucide-react'

import { Image } from '@/components/image/Image'

type TravelHitVariant = 'article' | 'podcast'

export interface TravelHitImageProps {
  variant: TravelHitVariant
  image?: string
  title: string
  containerClassName: string
  sizes?: string
}

export const TravelHitImage = ({
  variant,
  image,
  title,
  containerClassName,
  sizes = '192px',
}: TravelHitImageProps) => (
  <div className={containerClassName}>
    {!image && variant === 'podcast' ? (
      <div className="bg-accent/10 flex h-full items-center justify-center">
        <Headphones className="text-accent/60 h-8 w-8" />
      </div>
    ) : (
      <Image
        src={image}
        alt={title || (variant === 'article' ? 'Article' : 'Podcast')}
        fill
        sizes={sizes}
        className={
          variant === 'article'
            ? 'object-cover transition-transform duration-500 group-hover:scale-105'
            : 'object-cover'
        }
      />
    )}

    {variant === 'podcast' && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
          <Play
            className="text-foreground ml-0.5 h-5 w-5"
            fill="currentColor"
          />
        </div>
      </div>
    )}
  </div>
)
