'use client'

import { Maximize2, Minimize2, Sparkles, Trash2, X } from 'lucide-react'

import { useChatWidgetMode } from '@/features/chatWidget/hooks/useChatWidgetMode'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { cn } from '@/lib/utils'

import type { ChatHeaderOwnProps } from 'instantsearch-ui-components'

const DefaultCloseIcon = () => <X />
const DefaultMinimizeIcon = () => <Minimize2 />
const DefaultMaximizeIcon = () => <Maximize2 />
const DefaultTitleIcon = () => <Sparkles />

/** Matches the custom assistant's title treatment and action order. */
export const ChatHeader = ({
  maximized = false,
  onToggleMaximize,
  onClose,
  onClear,
  canClear = false,
  closeIconComponent: CloseIcon = DefaultCloseIcon,
  minimizeIconComponent: MinimizeIcon = DefaultMinimizeIcon,
  maximizeIconComponent: MaximizeIcon = DefaultMaximizeIcon,
  titleIconComponent: TitleIcon = DefaultTitleIcon,
  classNames,
  translations,
}: ChatHeaderOwnProps) => {
  const config = useActiveConfig()
  const basePath = config ? `/${config.slug}` : ''
  const mode = useChatWidgetMode(basePath)
  const isFullMode = maximized || mode === 'fullscreen'

  return (
    <div
      className={cn('ais-ChatHeader sw-ChatWidget-header', classNames?.root)}>
      <span className={cn('ais-ChatHeader-title', classNames?.title)}>
        {isFullMode && (
          <span
            aria-hidden
            className={cn('ais-ChatHeader-titleIcon', classNames?.titleIcon)}>
            <TitleIcon />
          </span>
        )}
        {translations?.title ?? 'AI Assistant'}
      </span>
      <div className="ais-ChatHeader-actions">
        {mode === 'side-panel' && onToggleMaximize && (
          <button
            type="button"
            onClick={onToggleMaximize}
            className={cn(
              'ais-ChatHeader-maximize hover:bg-muted rounded-button flex h-8 w-8 cursor-pointer items-center justify-center transition-colors',
              classNames?.maximize,
            )}
            aria-label={
              maximized
                ? (translations?.minimizeLabel ?? 'Minimize panel')
                : (translations?.maximizeLabel ?? 'Expand panel')
            }>
            {maximized ? (
              <MinimizeIcon />
            ) : (
              <MaximizeIcon maximized={maximized} />
            )}
          </button>
        )}
        {canClear && onClear && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'ais-ChatHeader-clear hover:bg-muted rounded-button flex h-8 w-8 cursor-pointer items-center justify-center transition-colors',
              classNames?.clear,
            )}
            aria-label={translations?.clearLabel ?? 'Clear conversation'}>
            <Trash2 />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'ais-ChatHeader-close hover:bg-muted rounded-button flex h-8 w-8 cursor-pointer items-center justify-center transition-colors',
            classNames?.close,
          )}
          aria-label={translations?.closeLabel ?? 'Close panel'}>
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}
