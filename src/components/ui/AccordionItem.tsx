'use client'

import { ChevronDown, Plus } from 'lucide-react'
import { motion, type HTMLMotionProps } from 'motion/react'
import {
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from 'react'

import { EASE_SMOOTH } from '@/lib/animations'
import { cn } from '@/lib/utils'

type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined
}

interface AccordionItemProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  variant?: 'default' | 'landing'
  triggerProps?: ComponentPropsWithoutRef<'button'> & DataAttributes
  contentProps?: HTMLMotionProps<'div'> & DataAttributes
}

export const AccordionItem = ({
  title,
  children,
  defaultOpen = false,
  className,
  variant = 'default',
  triggerProps,
  contentProps,
}: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const id = useId()
  const isLanding = variant === 'landing'
  const Icon = isLanding ? ChevronDown : Plus

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    triggerProps?.onClick?.(event)
    if (!event.defaultPrevented) setIsOpen((value) => !value)
  }

  return (
    <div
      className={cn(
        isLanding
          ? 'mt-6 border-t border-slate-200 pt-4'
          : 'border-border border-b',
        className,
      )}>
      <button
        {...triggerProps}
        type="button"
        id={`${id}-trigger`}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        onClick={handleToggle}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between text-left',
          isLanding
            ? 'gap-2 rounded-sm text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-600'
            : 'py-4',
          triggerProps?.className,
        )}>
        <span className={cn('font-medium', !isLanding && 'text-foreground')}>
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? (isLanding ? 180 : 225) : 0 }}
          transition={{ duration: 0.3, ease: EASE_SMOOTH }}
          aria-hidden>
          <Icon
            className={cn(
              'h-4 w-4 shrink-0',
              !isLanding && 'text-muted-foreground',
            )}
          />
        </motion.div>
      </button>
      <motion.div
        {...contentProps}
        id={`${id}-content`}
        aria-labelledby={`${id}-trigger`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: EASE_SMOOTH }}
        className={cn('overflow-hidden', contentProps?.className)}>
        <div
          className={cn(
            'text-sm',
            isLanding ? 'pt-4 text-slate-600' : 'text-muted-foreground pb-4',
          )}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
