import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

type LogoProps = {
  src: string
  href: string
  alt?: string
  className?: string
  imageClassName?: string
}

export const Logo = ({
  src,
  href,
  alt = 'Logo',
  className = '',
  imageClassName,
}: LogoProps) => (
  <Link href={href} className={className}>
    <Image
      src={src}
      alt={alt}
      width={120}
      height={40}
      className={cn('h-8 w-auto md:h-12', imageClassName)}
    />
  </Link>
)
