import { Quote } from 'lucide-react'

import { Image } from '@/components/image/Image'

export const TravelArticleFeature = ({
  image,
  title,
  quote,
}: {
  image?: string
  title: string
  quote: string
}) => (
  <div className="border-accent/25 bg-highlight shadow-accent/15 my-12 grid gap-6 overflow-hidden rounded-2xl border shadow-xl lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <div className="bg-muted relative aspect-square overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 34vw"
        className="object-cover"
      />
    </div>

    <div className="text-foreground flex flex-col justify-center px-6 py-8 lg:px-8">
      <div className="text-accent flex items-center gap-3">
        <Quote className="h-8 w-8" />
      </div>
      <blockquote className="mt-6 text-2xl leading-tight font-light text-balance md:text-[2.2rem]">
        {quote}
      </blockquote>
    </div>
  </div>
)
