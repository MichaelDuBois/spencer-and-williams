import { collapseBlocks } from '@/app/b2b-content/_utils/getB2BContentHitValues'
import type {
  B2BContentArticleHitValues,
  B2BContentBlogHitValues,
  B2BContentDocumentationHitValues,
  B2BContentResourceHitValues,
} from '@/app/b2b-content/hitValues.types'

export type B2BContentType = 'documentation' | 'article' | 'blog' | 'resource'

export type B2BContentProps =
  | { documentation: B2BContentDocumentationHitValues }
  | { article: B2BContentArticleHitValues }
  | { blog: B2BContentBlogHitValues }
  | { resource: B2BContentResourceHitValues }

interface B2BContentInfoMap {
  documentation: {
    contentType: 'documentation'
    indexKey: 'documentation'
    record: B2BContentDocumentationHitValues
  }
  article: {
    contentType: 'article'
    indexKey: 'articles'
    record: B2BContentArticleHitValues
  }
  blog: {
    contentType: 'blog'
    indexKey: 'blogs'
    record: B2BContentBlogHitValues
  }
  resource: {
    contentType: 'resource'
    indexKey: 'resources'
    record: B2BContentResourceHitValues
  }
}

export type B2BContentInfo = B2BContentInfoMap[keyof B2BContentInfoMap] & {
  fallbackSummary: string
}

export const getB2BContentInfo = (props: B2BContentProps): B2BContentInfo => {
  if ('documentation' in props) {
    return {
      contentType: 'documentation',
      indexKey: 'documentation',
      record: props.documentation,
      fallbackSummary: props.documentation.description?.trim() ?? '',
    }
  }
  if ('article' in props) {
    return {
      contentType: 'article',
      indexKey: 'articles',
      record: props.article,
      fallbackSummary: collapseBlocks(props.article.body)?.trim() ?? '',
    }
  }
  if ('blog' in props) {
    return {
      contentType: 'blog',
      indexKey: 'blogs',
      record: props.blog,
      fallbackSummary: props.blog.description?.trim() ?? '',
    }
  }
  return {
    contentType: 'resource',
    indexKey: 'resources',
    record: props.resource,
    fallbackSummary: props.resource.description?.trim() ?? '',
  }
}
