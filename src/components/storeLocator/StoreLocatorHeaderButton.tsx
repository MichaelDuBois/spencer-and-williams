'use client'

import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { getLocatorNoun } from '@/components/storeLocator/getLocatorNoun'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { cn } from '@/lib/utils'

interface StoreLocatorHeaderButtonProps {
  basePath: string
}

export const StoreLocatorHeaderButton = ({
  basePath,
}: StoreLocatorHeaderButtonProps) => {
  const pathname = usePathname()
  const config = useActiveConfig()
  const { plural } = getLocatorNoun(config)
  const isActive = pathname === `${basePath}/stores`

  return (
    <Link
      href={`${basePath}/stores`}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-muted-foreground hover:text-foreground',
      )}
      aria-label={`Find ${plural}`}
      aria-current={isActive ? 'page' : undefined}>
      <MapPin className="h-5 w-5" />
    </Link>
  )
}
