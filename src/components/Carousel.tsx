'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, type ReactNode } from 'react'

interface CarouselProps {
  children: ReactNode
  className?: string
  showGradient?: boolean
  gapClassName?: string
}

export const Carousel = ({
  children,
  className = '',
  showGradient = true,
  gapClassName = 'gap-6',
}: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const card = scrollRef.current.firstElementChild as HTMLElement | null
    const gap = parseFloat(getComputedStyle(scrollRef.current).columnGap) || 24
    const cardWidth = card ? card.offsetWidth + gap : 344
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    })
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => scroll('left')}
        className="bg-background text-foreground absolute top-1/2 -left-3 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-md transition-all hover:scale-110 hover:shadow-lg"
        aria-label="Scroll left">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scroll('right')}
        className="bg-background text-foreground absolute top-1/2 -right-3 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-md transition-all hover:scale-110 hover:shadow-lg"
        aria-label="Scroll right">
        <ChevronRight className="h-4 w-4" />
      </button>

      {showGradient && (
        <div className="pointer-events-none absolute top-0 right-0 bottom-4 z-5 w-24 bg-linear-to-l from-white to-transparent" />
      )}

      <div
        ref={scrollRef}
        className={`scrollbar-slim flex ${gapClassName} overflow-x-auto scroll-smooth pb-4`}>
        {children}
      </div>
    </div>
  )
}
