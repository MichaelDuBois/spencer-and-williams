'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: TooltipPosition
  delay?: number
  className?: string
}

interface TooltipCoords {
  top: number
  left: number
  transform: string
}

const GAP = 8

const getCoords = (rect: DOMRect, position: TooltipPosition): TooltipCoords => {
  switch (position) {
    case 'top':
      return {
        top: rect.top - GAP,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
      }
    case 'left':
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - GAP,
        transform: 'translate(-100%, -50%)',
      }
    case 'right':
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + GAP,
        transform: 'translate(0, -50%)',
      }
    case 'bottom':
    default:
      return {
        top: rect.bottom + GAP,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, 0)',
      }
  }
}

export const Tooltip = ({
  content,
  children,
  position = 'bottom',
  delay = 200,
  className,
}: TooltipProps) => {
  const [coords, setCoords] = useState<TooltipCoords | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      const el = triggerRef.current
      if (el) {
        setCoords(getCoords(el.getBoundingClientRect(), position))
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setCoords(null)
  }

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}>
      {children}
      {coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="pointer-events-none fixed z-110"
            style={{
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
            }}
            role="tooltip">
            <div
              className={cn(
                'rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg',
                'animate-in fade-in-0 zoom-in-95 duration-150',
              )}>
              {content}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
