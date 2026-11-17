'use client'

import { usePathname } from 'next/navigation'

import { isHomepage } from '@/lib/routes'

interface UseIsAIAssistantRouteResult {
  isHomepage: boolean
  isValidRoute: boolean
  searchPath: string
}

/**
 * Hook for determining if the current route is valid for displaying the AI Assistant.
 */
export const useIsAIAssistantRoute = (
  basePath: string,
): UseIsAIAssistantRouteResult => {
  const pathname = usePathname()

  const searchPath = `${basePath}/search`
  const productPath = `${basePath}/product`
  const cartPath = `${basePath}/cart`
  const orderPath = `${basePath}/order`
  const affinitiesPath = `${basePath}/affinities`
  const articlePath = `${basePath}/article`
  const podcastPath = `${basePath}/podcast`
  const blogPath = `${basePath}/blog`
  const documentationPath = `${basePath}/documentation`
  const resourcePath = `${basePath}/resource`
  const categoryPath = `${basePath}/category`
  const collectionPath = `${basePath}/collection`
  const groceryListPath = `${basePath}/list`
  const groceryRecipePath = `${basePath}/recipe`
  const myListPath = `${basePath}/my-list`
  const titlePath = `${basePath}/title`

  const isCurrentRouteHomepage = isHomepage(pathname, basePath)

  const isValidRoute =
    pathname.startsWith(searchPath) ||
    pathname.startsWith(productPath) ||
    pathname.startsWith(cartPath) ||
    pathname.startsWith(orderPath) ||
    pathname.startsWith(affinitiesPath) ||
    pathname.startsWith(articlePath) ||
    pathname.startsWith(podcastPath) ||
    pathname.startsWith(blogPath) ||
    pathname.startsWith(documentationPath) ||
    pathname.startsWith(resourcePath) ||
    pathname.startsWith(categoryPath) ||
    pathname.startsWith(collectionPath) ||
    pathname.startsWith(groceryListPath) ||
    pathname.startsWith(groceryRecipePath) ||
    pathname.startsWith(myListPath) ||
    pathname.startsWith(titlePath)

  return {
    isHomepage: isCurrentRouteHomepage,
    isValidRoute,
    searchPath,
  }
}
