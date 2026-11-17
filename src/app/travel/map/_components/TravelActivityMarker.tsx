'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { ActivityHitValues } from '@/app/travel/hitValues.types'
import { Image } from '@/components/image/Image'
import { cn } from '@/lib/utils'

interface TravelActivityMarkerProps {
  activity: ActivityHitValues
  isHovered: boolean
  onHover: (id: string | null) => void
  portalPopup?: boolean
}

export const TravelActivityMarker = ({
  activity,
  isHovered,
  onHover,
  portalPopup = false,
}: TravelActivityMarkerProps) => {
  const dotRef = useRef<HTMLDivElement>(null)
  const [portalRect, setPortalRect] = useState<DOMRect | null>(null)

  const handleMouseEnter = () => {
    if (portalPopup && dotRef.current) {
      setPortalRect(dotRef.current.getBoundingClientRect())
    }
    onHover(activity.objectID)
  }

  const handleMouseLeave = () => {
    setPortalRect(null)
    onHover(null)
  }

  const popupBody = (
    <>
      {activity.image && (
        <div className="bg-muted relative mb-2 h-20 w-full overflow-hidden rounded-sm">
          <Image
            src={activity.image}
            alt={activity.title}
            fill
            className="object-cover"
            sizes="176px"
          />
        </div>
      )}
      <div className="text-foreground line-clamp-2 text-xs font-medium">
        {activity.title}
      </div>
    </>
  )

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div
        ref={dotRef}
        className={cn(
          'h-3.5 w-3.5 cursor-pointer rounded-full border-2 border-white shadow-sm transition-transform',
          'bg-muted-foreground',
          isHovered && 'scale-150',
        )}
      />
      {isHovered && !portalPopup && (
        <div className="bg-background border-border absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 rounded-md border p-2 shadow-lg">
          {popupBody}
        </div>
      )}
      {isHovered &&
        portalPopup &&
        portalRect &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: portalRect.left + portalRect.width / 2,
              top: portalRect.top - 8,
              transform: 'translate(-50%, -100%)',
            }}
            className="bg-background border-border pointer-events-none z-50 w-44 rounded-md border p-2 shadow-lg">
            {popupBody}
          </div>,
          document.body,
        )}
    </div>
  )
}
