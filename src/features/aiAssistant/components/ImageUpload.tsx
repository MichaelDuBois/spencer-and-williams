'use client'

import { Camera, X } from 'lucide-react'
import Image from 'next/image'
import { type ChangeEvent, useRef } from 'react'

import type { UploadedImage } from '@/features/aiAssistant/hooks/useUploadedImage'
import { cn } from '@/lib/utils'

interface ImageUploadButtonProps {
  disabled: boolean
  onUploadFile: (file: File) => void
  compact?: boolean
}

export const ImageUploadButton = ({
  disabled,
  onUploadFile,
  compact = false,
}: ImageUploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onUploadFile(file)
    event.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label="Upload an image"
        title="Upload an image"
        className={cn(
          'cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          compact
            ? 'text-muted-foreground hover:bg-muted rounded-button m-1 inline-flex h-8 w-10'
            : 'border-border bg-background text-foreground hover:bg-muted rounded-button flex shrink-0 border px-3 py-2',
        )}>
        <Camera className="h-4 w-4" />
      </button>
    </>
  )
}

interface ImageUploadPreviewProps {
  uploaded: UploadedImage
  disabled?: boolean
  onClear: () => void
  compact?: boolean
}

export const ImageUploadPreview = ({
  uploaded,
  disabled = false,
  onClear,
  compact = false,
}: ImageUploadPreviewProps) => (
  <div className="from-accent/10 to-primary/10 rounded-card flex items-center gap-3 bg-linear-to-r p-3">
    <div
      className={cn(
        'rounded-image relative shrink-0 overflow-hidden',
        compact ? 'h-14 w-14' : 'h-24 w-24',
      )}>
      <Image
        src={uploaded.dataUrl}
        alt="Image ready to send"
        fill
        sizes={compact ? '56px' : '96px'}
        unoptimized
        className="object-cover"
      />
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        aria-label="Remove image"
        className="bg-background/80 text-foreground hover:bg-background absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed">
        <X className="h-3 w-3" />
      </button>
    </div>
    <div className="min-w-0">
      <p className="text-foreground text-sm font-semibold">
        Image ready to send
      </p>
      <p className="text-muted-foreground text-xs">
        Add a question about this image or send as is.
      </p>
    </div>
  </div>
)
