import { Switch } from '@/components/ui/Switch'
import { Tooltip } from '@/components/ui/Tooltip'

export interface DemoOptionToggleProps {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  disabledTooltip?: string
}

export const DemoOptionToggle = ({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  disabledTooltip,
}: DemoOptionToggleProps) => {
  const control = (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-foreground text-xs font-medium">{label}</p>
        <p className="text-muted-foreground text-micro mt-0.5">{description}</p>
      </div>
      {disabled && disabledTooltip ? (
        <Tooltip content={disabledTooltip} position="left">
          {control}
        </Tooltip>
      ) : (
        control
      )}
    </div>
  )
}
