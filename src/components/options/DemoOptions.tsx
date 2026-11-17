'use client'

import { FlaskConical } from 'lucide-react'
import { useState } from 'react'

import { DemoOptionToggle } from '@/components/options/DemoOptionToggle'
import { useDemoOptions } from '@/components/options/hooks/useDemoOptions'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export const DemoOptions = () => {
  const options = useDemoOptions()
  const [isOpen, setIsOpen] = useState(false)

  const isAnyEnabled = options.some((opt) => opt.checked)

  if (options.length === 0) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors',
            isAnyEnabled
              ? 'bg-accent/10 text-accent'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label="Demo options">
          <FlaskConical className="h-5 w-5" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="z-100 w-56 space-y-3 p-3">
        {options.map((option) => (
          <DemoOptionToggle key={option.label} {...option} />
        ))}
      </PopoverContent>
    </Popover>
  )
}
