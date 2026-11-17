'use client'

import { TriangleAlert } from 'lucide-react'

import { useStagingSyncCountdown } from '@/components/options/hooks/useStagingSyncCountdown'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'

import type { ReactNode } from 'react'

interface StagingNoticePopoverProps {
  isOpen: boolean
  onDismiss: () => void
  onConfirm: () => void
  children: ReactNode
}

export const StagingNoticePopover = ({
  isOpen,
  onDismiss,
  onConfirm,
  children,
}: StagingNoticePopoverProps) => {
  // Radix mounts the content only while open, so this never reaches SSR output.
  const timeUntilLabel = useStagingSyncCountdown(isOpen)

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onDismiss()
      }}>
      {/* Not `asChild`: the anchored child can be a Tooltip, which forwards no ref. */}
      <PopoverAnchor className="flex items-center">{children}</PopoverAnchor>

      {/* z-70 clears the z-60 DemoBar; Radix portals this to document.body. */}
      <PopoverContent
        align="end"
        aria-label="Switching to the staging app"
        className="z-70 w-80 space-y-3 border border-amber-200 bg-white p-4 text-slate-600 ring-slate-200">
        <div className="flex items-start gap-2">
          <TriangleAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            aria-hidden
          />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-900">
              Switching to the staging app
            </p>
            <p className="text-micro text-slate-600">
              Staging app is shared - other people have access, so rules and
              config can change under you mid-demo.
            </p>
            <p className="text-micro text-slate-600">
              It is also refreshed from production every 3 hours so anything you
              set up in staging can be overwritten without warning.
            </p>
            <p className="text-micro font-medium text-amber-600">
              Next refresh in {timeUntilLabel}.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-button cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-button cursor-pointer bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700">
            Use staging
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
