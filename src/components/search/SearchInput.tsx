'use client'

import clsx from 'clsx'
import { useState } from 'react'

import { SearchInputFields } from '@/components/search/SearchInputFields'
import { useSearchInput } from '@/hooks/useSearchInput'

interface SearchInputProps {
  basePath: string
  placeholder?: string
  className?: string
}

export const SearchInput = ({
  basePath,
  placeholder = 'Search...',
  className,
}: SearchInputProps) => {
  const {
    inputValue,
    inputRef,
    handleInputChange,
    handleClear,
    handleFocus,
    handleSubmit,
    handleAIModeClick,
  } = useSearchInput(basePath)

  const [isFocused, setIsFocused] = useState(false)

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx('relative w-full rounded-full transition-shadow', {
        'ring-accent/20 ring-2': isFocused,
      })}>
      <div
        className={clsx(
          'flex h-11 w-full items-center gap-3 rounded-full border px-3',
          className ?? 'bg-white',
          !className && {
            'border-accent/30': isFocused,
            'border-border': !isFocused,
          },
        )}
        style={{ boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
        <SearchInputFields
          inputRef={inputRef}
          inputValue={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true)
            handleFocus()
          }}
          onBlur={() => setIsFocused(false)}
          onClear={handleClear}
          onAIModeClick={handleAIModeClick}
        />
      </div>
    </form>
  )
}
