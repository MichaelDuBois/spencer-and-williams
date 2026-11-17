'use client'

import { ImagePlus, Loader2 } from 'lucide-react'
import { useRef } from 'react'

import { useGroceryListImageImport } from '@/app/grocery/_hooks/useGroceryListImageImport'
import { Button } from '@/components/ui/button/Button'

interface GroceryListImportButtonProps {
  onImport: (items: string[]) => void
}

export const GroceryListImportButton = ({
  onImport,
}: GroceryListImportButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { importImage, isPending, isError, error, isEmpty } =
    useGroceryListImageImport({ onImportSuccess: onImport })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) importImage(file)
    // Reset so selecting the same file again re-triggers the change event.
    event.target.value = ''
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        className="rounded-button w-full"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing image…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" />
            Import from photo
          </>
        )}
      </Button>

      {isError && (
        <p className="text-destructive text-xs">
          {error?.message ?? 'Something went wrong. Please try again.'}
        </p>
      )}
      {isEmpty && (
        <p className="text-muted-foreground text-xs">
          No grocery items found in that image.
        </p>
      )}
    </div>
  )
}
