import { describe, it, expect } from 'vitest'

import { cn } from '@/lib/utils'

// cn() = clsx() + twMerge(). Two jobs:
// 1. clsx: accepts conditional classes (strings, objects, arrays, falsy values)
// 2. twMerge: resolves Tailwind conflicts (e.g. "p-4" + "p-2" → "p-2")
//
// This is THE most used utility function in the entire project.

describe('cn', () => {
  // ── Tailwind merge ────────────────────────────────────────────────
  // When two Tailwind classes conflict, the last one wins.
  // Without twMerge, we'd get "p-4 p-2" → unpredictable styles.
  describe('Tailwind class merging', () => {
    it('resolves conflicting Tailwind classes (last wins)', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('resolves conflicting text colors', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('keeps non-conflicting classes', () => {
      expect(cn('p-4', 'mt-2')).toBe('p-4 mt-2')
    })
  })

  // ── Conditional classes (clsx pattern) ────────────────────────────
  // Allows writing cn("base", isActive && "bg-blue-500") instead of
  // manual string concatenation.
  describe('conditional classes', () => {
    it('handles object syntax for conditional classes', () => {
      const result = cn('base', { 'bg-blue-500': true, 'bg-red-500': false })
      expect(result).toBe('base bg-blue-500')
    })

    it('handles boolean && pattern', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base active')
    })
  })

  // ── Falsy values ──────────────────────────────────────────────────
  // In JSX we often pass undefined/null/false — cn must not crash.
  describe('falsy inputs', () => {
    it('ignores undefined', () => {
      expect(cn('base', undefined)).toBe('base')
    })

    it('ignores null', () => {
      expect(cn('base', null)).toBe('base')
    })

    it('ignores false', () => {
      expect(cn('base', false)).toBe('base')
    })

    it('handles all falsy values at once', () => {
      expect(cn(undefined, null, false, 'survivor')).toBe('survivor')
    })
  })
})
