'use client'

import { TriangleAlert } from 'lucide-react'

import { useStagingSwitchGate } from '@/components/options/hooks/useStagingSwitchGate'
import { useStagingSyncCountdown } from '@/components/options/hooks/useStagingSyncCountdown'
import { StagingNoticePopover } from '@/components/options/StagingNoticePopover'
import { Switch } from '@/components/ui/Switch'
import { Tooltip } from '@/components/ui/Tooltip'
import { useAlgoliaEnvironment } from '@/hooks/useAlgoliaEnvironment'
import { cn } from '@/lib/utils'

interface AlgoliaEnvironmentToggleProps {
  className?: string
  disabled?: boolean
  disabledTooltip?: string
  onNoticeOpenChange?: (isOpen: boolean) => void
}

export const AlgoliaEnvironmentToggle = ({
  className,
  disabled,
  disabledTooltip,
  onNoticeOpenChange,
}: AlgoliaEnvironmentToggleProps) => {
  const { isStaging } = useAlgoliaEnvironment()
  const { isNoticeOpen, requestChange, confirm, cancel, reopen } =
    useStagingSwitchGate({ onNoticeOpenChange })

  const isStagingLive = isStaging && !disabled
  const syncCountdown = useStagingSyncCountdown(isStagingLive)

  const control = (
    <Switch
      checked={isStaging}
      onCheckedChange={requestChange}
      disabled={disabled}
      aria-label="Use the staging Algolia app"
      className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-slate-300"
    />
  )

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Literal colors: outside a theme wrapper `--accent` is near-white. */}
      <div className="text-right">
        <span
          className={cn(
            'text-xs font-medium',
            isStagingLive ? 'text-amber-600' : 'text-slate-400',
          )}>
          Staging
        </span>
        {isStagingLive && (
          <p className="text-micro text-amber-600">
            Shared app · resets in {syncCountdown}
          </p>
        )}
      </div>
      {isStagingLive && (
        <button
          type="button"
          onClick={reopen}
          aria-label="Why staging is risky"
          className="cursor-pointer text-amber-600 transition-colors hover:text-amber-700">
          <TriangleAlert className="h-4 w-4" aria-hidden />
        </button>
      )}
      <StagingNoticePopover
        isOpen={isNoticeOpen}
        onDismiss={cancel}
        onConfirm={confirm}>
        {disabled && disabledTooltip ? (
          <Tooltip content={disabledTooltip} position="right">
            {control}
          </Tooltip>
        ) : (
          control
        )}
      </StagingNoticePopover>
    </div>
  )
}
