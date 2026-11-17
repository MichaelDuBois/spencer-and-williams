'use client'

import { Globe } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

interface TravelMapHeaderButtonProps {
  basePath: string
}

export const TravelMapHeaderButton = ({
  basePath,
}: TravelMapHeaderButtonProps) => {
  const pathname = usePathname()
  const isActive = pathname === `${basePath}/map`

  return (
    <Link
      href={`${basePath}/map`}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-muted-foreground hover:text-foreground',
      )}
      aria-label="Explore on map"
      aria-current={isActive ? 'page' : undefined}>
      <Globe className="h-5 w-5" />
    </Link>
  )
}
