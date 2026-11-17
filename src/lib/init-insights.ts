import aa from 'search-insights'

let initedCredentials = ''

/** Re-points the `search-insights` singleton whenever the credentials change. */
export const initInsights = (appId: string, apiKey: string): void => {
  const credentials = `${appId}:${apiKey}`
  if (!appId || !apiKey || initedCredentials === credentials) return

  aa('init', { appId, apiKey, useCookie: true, partial: true })
  initedCredentials = credentials
}
