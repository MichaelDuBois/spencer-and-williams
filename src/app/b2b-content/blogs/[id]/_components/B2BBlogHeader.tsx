import { CalendarDays, Newspaper, UserRound } from 'lucide-react'

import { ContentBreadcrumb } from '@/app/b2b-content/_components/ContentBreadcrumb'
import { ContentPDPTitleHeading } from '@/app/b2b-content/_components/pdpComponents/ContentPDPTitleHeading'
import type { B2BContentBlogHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BBlogHeader = ({ blog }: { blog: B2BContentBlogHitValues }) => {
  const breadcrumbItems = ['Algolia Blog', blog.category].filter(
    Boolean,
  ) as string[]

  return (
    <header>
      <ContentBreadcrumb items={breadcrumbItems} />

      {blog.category && (
        <ContentPDPTitleHeading>{blog.category}</ContentPDPTitleHeading>
      )}

      <h1 className="text-foreground flex items-start gap-3 text-3xl leading-tight font-bold md:text-4xl">
        <span
          className="bg-accent/10 text-accent mt-1 inline-flex shrink-0 items-center justify-center rounded-md p-2"
          aria-hidden="true">
          <Newspaper className="h-6 w-6" />
        </span>
        <span>{blog.title}</span>
      </h1>

      {blog.description && (
        <p className="text-muted-foreground mt-5 text-base leading-relaxed md:text-lg">
          {blog.description}
        </p>
      )}

      {(blog.authorDisplay || blog.publishedAt) && (
        <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {blog.authorDisplay && (
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {blog.authorDisplay}
            </span>
          )}
          {blog.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {blog.publishedAt}
            </span>
          )}
        </div>
      )}
    </header>
  )
}
