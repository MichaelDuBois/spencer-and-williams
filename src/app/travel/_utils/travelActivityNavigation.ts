export const getRelatedActivityHref = (objectID: string, slug: string) => {
  if (objectID.startsWith('article-')) return `/${slug}/article/${objectID}`
  if (objectID.startsWith('podcast-')) return `/${slug}/podcast/${objectID}`

  return null
}
