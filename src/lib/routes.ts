const MAP_ROUTE_SEGMENTS = new Set(['map', 'stores'])

export const normalizePath = (path: string): string =>
  path.endsWith('/') ? path.slice(0, -1) : path

export const isHomepage = (pathname: string, basePath: string): boolean =>
  basePath.length > 0 && normalizePath(pathname) === normalizePath(basePath)

export const isMapRoute = (pathname: string): boolean =>
  pathname.split('/').some((segment) => MAP_ROUTE_SEGMENTS.has(segment))
