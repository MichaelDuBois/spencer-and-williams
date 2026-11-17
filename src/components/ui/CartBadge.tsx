'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface CartBadgeProps {
  href: string
  className?: string
}

export const CartBadge = ({ href, className }: CartBadgeProps) => {
  const { totalItems } = useCart()
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      aria-label={`Cart with ${totalItems} items`}
      aria-current={isActive ? 'page' : undefined}>
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="bg-primary text-primary-foreground text-micro absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
