import { beforeEach, describe, expect, it, vi } from 'vitest'

import { track } from '@/lib/analytics/track'

const { trackMock, isAmplitudeEnabledMock } = vi.hoisted(() => {
  return {
    trackMock: vi.fn(),
    isAmplitudeEnabledMock: vi.fn(() => false),
  }
})

vi.mock('@amplitude/analytics-browser', () => {
  return { track: trackMock }
})

vi.mock('@/lib/analytics/amplitude', () => {
  return { isAmplitudeEnabled: isAmplitudeEnabledMock }
})

describe('track', () => {
  beforeEach(() => {
    trackMock.mockClear()
    isAmplitudeEnabledMock.mockReset()
  })

  it('sends nothing while Amplitude is not enabled', () => {
    isAmplitudeEnabledMock.mockReturnValue(false)

    track('assistant_opened', { surface: 'ai_assistant' })

    expect(trackMock).not.toHaveBeenCalled()
  })

  it('forwards the event name and properties once Amplitude is enabled', () => {
    isAmplitudeEnabledMock.mockReturnValue(true)

    track('assistant_message_sent', {
      surface: 'chat_widget',
      message: 'do you sell tents?',
    })

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('assistant_message_sent', {
      surface: 'chat_widget',
      message: 'do you sell tents?',
    })
  })
})
