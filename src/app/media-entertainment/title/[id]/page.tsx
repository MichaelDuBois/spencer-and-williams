'use client'

import { useParams } from 'next/navigation'

const TitlePage = () => {
  const params = useParams()
  const titleId = params.id as string

  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <h1 className="text-foreground text-2xl font-semibold">
        Title {titleId}
      </h1>
      <p className="text-muted-foreground mt-4">
        The detail page is coming soon.
      </p>
    </div>
  )
}

export default TitlePage
