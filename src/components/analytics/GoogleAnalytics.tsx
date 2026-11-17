'use client'

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google'

import { useGaPageview } from '@/hooks/useGaPageview'

interface GoogleAnalyticsProps {
  gaId: string
}

export const GoogleAnalytics = ({ gaId }: GoogleAnalyticsProps) => {
  useGaPageview()

  return <NextGoogleAnalytics gaId={gaId} />
}
