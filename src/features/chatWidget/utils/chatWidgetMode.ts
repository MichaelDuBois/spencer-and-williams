import { isHomepage, isMapRoute } from '@/lib/routes'

export type ChatWidgetMode = 'fullscreen' | 'side-panel'

export const getChatWidgetMode = (
  pathname: string,
  basePath: string,
): ChatWidgetMode =>
  isHomepage(pathname, basePath) || isMapRoute(pathname)
    ? 'fullscreen'
    : 'side-panel'
