import { describe, expect, it } from 'vitest'

import { getChatWidgetMode } from '@/features/chatWidget/utils/chatWidgetMode'

describe('getChatWidgetMode', () => {
  it('uses fullscreen mode on a vertical homepage, including a trailing slash', () => {
    expect(getChatWidgetMode('/ecommerce', '/ecommerce')).toBe('fullscreen')
    expect(getChatWidgetMode('/ecommerce/', '/ecommerce')).toBe('fullscreen')
  })

  it('uses fullscreen mode on map routes', () => {
    expect(getChatWidgetMode('/ecommerce/map', '/ecommerce')).toBe('fullscreen')
    expect(getChatWidgetMode('/ecommerce/stores/london', '/ecommerce')).toBe(
      'fullscreen',
    )
  })

  it('uses side-panel mode on content routes', () => {
    expect(getChatWidgetMode('/ecommerce/search', '/ecommerce')).toBe(
      'side-panel',
    )
  })
})
