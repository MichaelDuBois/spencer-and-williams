import { describe, expect, it } from 'vitest'

import { FashionArticleBody } from '@/app/fashion/article/[id]/_components/FashionArticleBody'

import { render, screen } from '@tests/helpers/test-utils'

describe('FashionArticleBody', () => {
  it('capitalizes every section heading', () => {
    render(
      <FashionArticleBody
        blocks={[
          { type: 'heading', text: 'why these pieces work together' },
          { type: 'text', text: 'The supporting article copy.' },
          { type: 'heading', text: 'how to wear it' },
        ]}
      />,
    )

    for (const heading of screen.getAllByRole('heading', { level: 2 })) {
      expect(heading).toHaveClass('capitalize')
    }
    expect(screen.getByText('The supporting article copy.')).not.toHaveClass(
      'capitalize',
    )
  })
})
