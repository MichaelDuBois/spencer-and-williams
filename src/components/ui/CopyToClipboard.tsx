'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface CopyToClipboardProps {
  value: string
  className?: string
}

export const CopyToClipboard = ({ value, className }: CopyToClipboardProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors',
        className,
      )}>
      {value}
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}
