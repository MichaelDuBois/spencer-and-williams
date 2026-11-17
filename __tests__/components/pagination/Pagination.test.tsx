import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from '@/components/pagination/Pagination'

const classNamesSpy = vi.fn()

vi.mock('react-instantsearch', () => {return {
  Pagination: (props: { classNames?: Record<string, string> }) => {
    classNamesSpy(props.classNames)
    return null
  },
}})

describe('Pagination', () => {
  it('defaults to the standard variant (bordered, boxed buttons)', () => {
    render(<Pagination />)
    const classNames = classNamesSpy.mock.lastCall?.[0]
    expect(classNames.link).toContain('rounded-button')
    expect(classNames.link).toContain('border-border')
    expect(classNames.link).not.toContain('rounded-full')
  })

  it('applies the elevated editorial variant for fashion', () => {
    render(<Pagination variant="editorial" />)
    const classNames = classNamesSpy.mock.lastCall?.[0]
    expect(classNames.link).toContain('rounded-full')
    expect(classNames.link).toContain('uppercase')
    expect(classNames.selectedItem).toContain('shadow-md')
  })

  it('merges a custom className into the root element', () => {
    render(<Pagination className="mt-20" />)
    const classNames = classNamesSpy.mock.lastCall?.[0]
    expect(classNames.root).toContain('mt-20')
    expect(classNames.root).toContain('flex justify-center')
  })
})
