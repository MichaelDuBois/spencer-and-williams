import { Image } from '@/components/image/Image'

interface ContentPDPHeroImageProps {
  imageUrl: string | null | undefined
  alt: string
}

export const ContentPDPHeroImage = ({
  imageUrl,
  alt,
}: ContentPDPHeroImageProps) => (
  <div className="bg-muted rounded-card relative mt-8 aspect-[16/9] w-full overflow-hidden">
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 100vw, 896px"
      className="object-cover"
      preload
    />
    {imageUrl && (
      <div
        className="bg-accent/80 absolute inset-0 mix-blend-color"
        aria-hidden="true"
      />
    )}
  </div>
)
