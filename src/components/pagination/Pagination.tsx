'use client'

import { Pagination as InstantSearchPagination } from 'react-instantsearch'

import { cn } from '@/lib/utils'

import type { ComponentProps } from 'react'

type InstantSearchPaginationProps = ComponentProps<
  typeof InstantSearchPagination
>

type PaginationClassNames = NonNullable<
  InstantSearchPaginationProps['classNames']
>

export type PaginationVariant = 'standard' | 'editorial'

export interface PaginationProps extends Omit<
  InstantSearchPaginationProps,
  'classNames'
> {
  variant?: PaginationVariant
  className?: string
}

const VARIANT_CLASSES: Record<PaginationVariant, PaginationClassNames> = {
  standard: {
    root: 'flex justify-center',
    list: 'flex items-center gap-1',
    item: '',
    link: 'flex h-10! w-10! ml-0! items-center justify-center bg-none! bg-card! p-0! text-sm font-medium! text-foreground! border! border-border! rounded-button! shadow-none! transition-colors hover:bg-muted!',
    selectedItem:
      '[&>a]:bg-accent! [&>a]:hover:bg-accent! [&>a]:text-accent-foreground! [&>a]:border-accent!',
    disabledItem: '*:opacity-40! *:cursor-not-allowed!',
  },
  editorial: {
    root: 'flex justify-center',
    list: 'flex items-center gap-3',
    item: '',
    link: 'flex h-11! w-11! ml-0! items-center justify-center bg-none! bg-transparent! p-0! text-xs! tracking-widest uppercase text-foreground! border-0! rounded-full! shadow-none! transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted!',
    selectedItem:
      '[&>a]:bg-accent! [&>a]:hover:bg-accent! [&>a]:text-accent-foreground! [&>a]:shadow-md! [&>a]:shadow-accent/25',
    disabledItem: '*:opacity-30! *:cursor-not-allowed!',
  },
}

export function Pagination({
  variant = 'standard',
  className,
  ...props
}: PaginationProps) {
  const classNames = VARIANT_CLASSES[variant]

  return (
    <InstantSearchPagination
      {...props}
      classNames={{
        ...classNames,
        root: cn(classNames.root, className),
      }}
    />
  )
}
