import * as amplitude from '@amplitude/analytics-browser'
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser'

import { demoContextPlugin } from '@/lib/analytics/demo-context-plugin'

let isEnabled = false

export const isAmplitudeEnabled = (): boolean => isEnabled

export const initAmplitude = (apiKey: string | undefined): void => {
  if (!apiKey) return

  // Plugins queued before init are set up ahead of the built-in page view
  // tracker, so the first page view already carries the context and replay ID.
  amplitude.add(demoContextPlugin())
  amplitude.add(
    sessionReplayPlugin({
      sampleRate: 1,
      privacyConfig: { defaultMaskLevel: 'light' },
    }),
  )

  amplitude.init(apiKey, {
    autocapture: {
      attribution: true,
      sessions: true,
      // Search state lives in query params: only path changes are page views.
      pageViews: { trackHistoryChanges: 'pathOnly' },
      elementInteractions: true,
      formInteractions: true,
      fileDownloads: false,
      frustrationInteractions: true,
    },
    logLevel:
      process.env.NODE_ENV === 'development'
        ? amplitude.Types.LogLevel.Debug
        : undefined,
  })
  isEnabled = true
}
