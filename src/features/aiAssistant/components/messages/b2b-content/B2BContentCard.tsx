import { ArticleCard } from '@/features/aiAssistant/components/messages/b2b-content/ArticleCard'
import { BlogCard } from '@/features/aiAssistant/components/messages/b2b-content/BlogCard'
import { DocumentationCard } from '@/features/aiAssistant/components/messages/b2b-content/DocumentationCard'
import { ResourceCard } from '@/features/aiAssistant/components/messages/b2b-content/ResourceCard'
import type {
  B2BContentDisplayItem,
  B2BContentType,
} from '@/features/aiAssistant/types'

interface B2BContentCardProps {
  item: B2BContentDisplayItem
  type: B2BContentType | null
  variant: 'grid' | 'carousel'
}

export const B2BContentCard = ({
  item,
  type,
  variant,
}: B2BContentCardProps) => {
  switch (type) {
    case 'documentation':
      return <DocumentationCard item={item} variant={variant} />
    case 'articles':
      return <ArticleCard item={item} variant={variant} />
    case 'blogs':
      return <BlogCard item={item} />
    case 'resources':
      return <ResourceCard item={item} />
    default:
      return <DocumentationCard item={item} variant={variant} />
  }
}
