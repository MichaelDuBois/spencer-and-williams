import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Register the custom `text-micro` font-size token (globals.css @theme) so that
// tailwind-merge treats it as a font-size and dedupes it against text-xs/sm/etc.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-micro'],
    },
  },
})

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
