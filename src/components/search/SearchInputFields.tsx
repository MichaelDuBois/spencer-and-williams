'use client'

import clsx from 'clsx'
import { Search, X } from 'lucide-react'

import {
  AIModeButton,
  type AIModeButtonSize,
} from '@/components/search/AIModeButton'

interface SearchInputFieldsProps {
  inputRef?: React.RefObject<HTMLInputElement | null>
  inputValue: string
  placeholder: string
  readOnly?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onFocus: () => void
  onBlur: () => void
  onClear: () => void
  onAIModeClick: () => void
  aiModeButtonSize?: AIModeButtonSize
  showAIButton?: boolean
}

export const SearchInputFields = ({
  inputRef,
  inputValue,
  placeholder,
  readOnly = false,
  onChange,
  onFocus,
  onBlur,
  onClear,
  onAIModeClick,
  aiModeButtonSize = 'sm',
  showAIButton = true,
}: SearchInputFieldsProps) => (
  <>
    <Search className="text-muted-foreground h-4 w-4 shrink-0" />
    <input
      ref={inputRef}
      type="search"
      enterKeyHint="search"
      value={inputValue}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      readOnly={readOnly}
      className={clsx(
        'text-muted-foreground min-w-0 flex-1 appearance-none border-0 bg-transparent text-sm outline-none',
        readOnly ? 'cursor-pointer' : 'cursor-text',
      )}
    />
    {!readOnly && inputValue && (
      <button
        type="button"
        onClick={onClear}
        className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
        aria-label="Clear search">
        <X className="h-4 w-4" />
      </button>
    )}
    {showAIButton && (
      <AIModeButton onClick={onAIModeClick} size={aiModeButtonSize} />
    )}
  </>
)
