import { BookOpen, Plug } from 'lucide-react'
import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'

import { getDocumentationTypeIcon } from '@/app/b2b-content/_utils/getDocumentationTypeIcon'

describe('getDocumentationTypeIcon', () => {
  it('returns the mapped icon for a known documentation type', () => {
    const icon = getDocumentationTypeIcon('integration')
    expect(isValidElement(icon)).toBe(true)
    expect(icon.type).toBe(Plug)
  })

  it('matches types case-insensitively and trims whitespace', () => {
    expect(getDocumentationTypeIcon('  INTEGRATION ').type).toBe(Plug)
  })

  it('falls back to BookOpen for an unknown type', () => {
    expect(getDocumentationTypeIcon('does-not-exist').type).toBe(BookOpen)
  })

  it('falls back to BookOpen for null or undefined', () => {
    expect(getDocumentationTypeIcon(null).type).toBe(BookOpen)
    expect(getDocumentationTypeIcon(undefined).type).toBe(BookOpen)
  })

  it('forwards props to the rendered icon', () => {
    const icon = getDocumentationTypeIcon('guide', { className: 'h-4 w-4' })
    expect(icon.props.className).toBe('h-4 w-4')
  })
})
