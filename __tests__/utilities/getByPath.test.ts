import { describe, it, expect } from 'vitest'

import { getByPath } from '@/utilities/getByPath'

// getByPath accesses a nested value in an object via a string path.
// It's the equivalent of lodash.get — used everywhere to read Algolia hits.

describe('getByPath', () => {
  // ── Dot notation ──────────────────────────────────────────────────
  // The most basic case: "a.b.c" navigates the object like obj.a.b.c
  describe('dot notation', () => {
    it('accesses a nested value via dot path', () => {
      const obj = { a: { b: { c: 42 } } }
      expect(getByPath(obj, 'a.b.c')).toBe(42)
    })

    it('accesses a top-level value', () => {
      const obj = { name: 'Spencer' }
      expect(getByPath(obj, 'name')).toBe('Spencer')
    })
  })

  // ── Bracket notation ──────────────────────────────────────────────
  // Algolia arrays often use items[0].name
  describe('bracket notation', () => {
    it('accesses array elements via bracket notation', () => {
      const obj = { items: ['first', 'second', 'third'] }
      expect(getByPath(obj, 'items[0]')).toBe('first')
      expect(getByPath(obj, 'items[2]')).toBe('third')
    })

    it('accesses nested objects inside arrays', () => {
      const obj = { items: [{ name: 'Widget' }] }
      expect(getByPath(obj, 'items[0].name')).toBe('Widget')
    })
  })

  // ── Mixed notation ────────────────────────────────────────────────
  describe('mixed notation', () => {
    it('handles mixed dot and bracket notation', () => {
      const obj = { a: { b: [{ c: 'deep' }] } }
      expect(getByPath(obj, 'a.b[0].c')).toBe('deep')
    })
  })

  // ── Default value ─────────────────────────────────────────────────
  // When the path doesn't exist, we want a fallback rather than undefined.
  // This is critical for display: better to show "" than crash.
  describe('default value', () => {
    it('returns defaultValue when path does not exist', () => {
      const obj = { a: 1 }
      expect(getByPath(obj, 'x.y.z', 'fallback')).toBe('fallback')
    })

    it('returns defaultValue when intermediate key is missing', () => {
      const obj = { a: { b: 1 } }
      expect(getByPath(obj, 'a.c.d', 0)).toBe(0)
    })
  })

  // ── Null / undefined object ───────────────────────────────────────
  // Algolia hits can be null in some edge cases.
  describe('null or undefined object', () => {
    it('returns defaultValue for null object', () => {
      expect(getByPath(null, 'a.b', 'safe')).toBe('safe')
    })

    it('returns defaultValue for undefined object', () => {
      expect(getByPath(undefined, 'a.b', 'safe')).toBe('safe')
    })
  })

  // ── Empty path ────────────────────────────────────────────────────
  describe('empty path', () => {
    it('returns defaultValue for an empty string path', () => {
      const obj = { a: 1 }
      expect(getByPath(obj, '', 'default')).toBe('default')
    })
  })

  // ── Leading dot ───────────────────────────────────────────────────
  // The .filter(Boolean) in source code handles this edge case.
  describe('leading dot in path', () => {
    it('handles a leading dot gracefully', () => {
      const obj = { a: { b: 'value' } }
      expect(getByPath(obj, '.a.b')).toBe('value')
    })
  })
})
